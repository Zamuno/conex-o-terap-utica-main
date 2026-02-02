
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "https://esm.sh/resend@2.0.0";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const EMAIL_FROM = '149Psi <nao-responda@149psi.com.br>'; // Adjust as needed

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  if (!signature) return new Response('No signature', { status: 400 });

  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const sendEmail = async (userId: string, type: string, subject: string, html: string) => {
    // 1. Check preferences
    const { data: prefs } = await supabaseClient
      .from('user_preferences')
      .select('email_notifications')
      .eq('user_id', userId)
      .single();

    if (prefs && !prefs.email_notifications) {
      // Log opt-out skip
      await supabaseClient.from('communication_logs').insert({
        user_id: userId,
        type,
        status: 'opt_out',
        metadata: { reason: 'user_disabled_notifications' }
      });
      return;
    }

    // 2. Get user email
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (!profile?.email) return;

    // 3. Send via Resend
    try {
      const { parse } = await import("https://deno.land/std@0.190.0/path/mod.ts");
      // Use Resend to send email
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to: profile.email,
        subject,
        html,
      });

      // 4. Log success
      await supabaseClient.from('communication_logs').insert({
        user_id: userId,
        type,
        status: 'sent',
        metadata: { resend_id: data.id, email: profile.email }
      });
    } catch (error) {
      console.error('Email send error:', error);
      await supabaseClient.from('communication_logs').insert({
        user_id: userId,
        type,
        status: 'failed',
        metadata: { error: error.message }
      });
    }
  };

  try {
    switch (event.type) {
      case 'video_session': // Ignore unknown events handled elsewhere
        break;

      case 'checkout.session.completed': {
        const session = event.data.object;
        if (!session.metadata?.user_id) break;

        await supabaseClient.from('subscriptions').upsert({
          user_id: session.metadata.user_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          plan: session.metadata.plan || 'default',
          role: session.metadata.role || 'patient',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'stripe_subscription_id' });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        if (!subscription.metadata?.user_id) {
          console.log(`Skipping event ${event.type} without metadata.user_id`);
          break;
        }

        const userId = subscription.metadata.user_id;
        const previousAttributes = event.data.previous_attributes;

        // Update DB first
        await supabaseClient.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan: subscription.items.data[0]?.price?.id,
          role: subscription.metadata.role || 'patient',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }, { onConflict: 'stripe_subscription_id' });

        // Logic for Email Alerts

        // 1. Moved to Past Due
        if (subscription.status === 'past_due' && previousAttributes?.status === 'active') {
          await sendEmail(
            userId,
            'past_due',
            'Precisamos da sua atenção sobre sua assinatura 149Psi',
            `<h1>Olá</h1>
             <p>Não conseguimos processar a renovação da sua assinatura recentemente.</p>
             <p>Para garantir que você continue acessando todos os recursos premium e seus dados de pacientes sem interrupções, por favor verifique seus dados de pagamento.</p>
             <p>Você ainda tem acesso garantido pelos próximos dias (Período de Tolerância).</p>
             <p><a href="https://149psi.com.br/subscription">Atualizar Pagamento Agora</a></p>`
          );
        }

        // 2. Reactivated (from past_due or canceled/unpaid to active)
        if (subscription.status === 'active' &&
          (previousAttributes?.status === 'past_due' || previousAttributes?.status === 'canceled' || previousAttributes?.status === 'unpaid')) {
          await sendEmail(
            userId,
            'reactivated',
            'Pagamento Confirmado: Sua assinatura está ativa!',
            `<h1>Obrigado!</h1><p>Recebemos seu pagamento e sua assinatura está 100% ativa novamente.</p>`
          );
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        if (!subscription.metadata?.user_id) break;

        const userId = subscription.metadata.user_id;

        await supabaseClient.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          status: 'canceled',
          plan: subscription.items.data[0]?.price?.id,
          role: subscription.metadata.role || 'patient',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }, { onConflict: 'stripe_subscription_id' });

        // Email: Canceled
        await sendEmail(
          userId,
          'canceled',
          'Confirmação de Cancelamento',
          `<h1>Sua assinatura foi cancelada</h1>
             <p>Sentiremos sua falta. Se houve algum problema, por favor nos avise.</p>
             <p>Seus dados permanecerão salvos caso decida voltar.</p>`
        );

        break;
      }
    }
  } catch (error) {
    console.error('Error processing event:', error);
    return new Response('Error processing event', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
