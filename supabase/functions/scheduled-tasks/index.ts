
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const EMAIL_FROM = '149Psi <nao-responda@149psi.com.br>';

serve(async (req) => {
    // Simple authorization check for cron (if passed via header)
    // or just rely on Service Role execution context if internal.
    // Ideally we check a secret header.

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
        // 1. Find subscriptions in 'past_due'
        // Grace Period = 7 days.
        // Warning trigger: 3 days remaining => 4 days elapsed.
        // Condition: current_period_end < Now - 4 days AND current_period_end > Now - 5 days (to avoid spamming older ones, catch them in a 24h window)

        // Actually, improved logic:
        // Find past_due subs.
        // Check if we ALREADY sent 'grace_period_warning' for this specific updated_at/period?
        // Using communication_logs to dedup is best.

        const { data: subs, error } = await supabaseClient
            .from('subscriptions')
            .select('user_id, status, current_period_end, updated_at')
            .eq('status', 'past_due');

        if (error) throw error;

        const results = { sent: 0, skipped: 0, errors: 0 };
        const now = new Date();

        for (const sub of (subs || [])) {
            if (!sub.current_period_end) continue;

            const periodEnd = new Date(sub.current_period_end);
            const diffMs = now.getTime() - periodEnd.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);

            // We want to trigger when diffDays is approx 4 (meaning 3 days left of 7).
            // Let's accept window [3.5, 4.5] to be safe for a daily cron.
            if (diffDays >= 3.5 && diffDays <= 4.5) {

                // Check if already sent
                const { data: existingLog } = await supabaseClient
                    .from('communication_logs')
                    .select('id')
                    .eq('user_id', sub.user_id)
                    .eq('type', 'grace_period_warning')
                    .gt('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()) // sent in last 7 days
                    .maybeSingle();

                if (existingLog) {
                    results.skipped++;
                    continue;
                }

                // Check preferences
                const { data: prefs } = await supabaseClient
                    .from('user_preferences')
                    .select('email_notifications')
                    .eq('user_id', sub.user_id)
                    .single();

                if (prefs && !prefs.email_notifications) {
                    await supabaseClient.from('communication_logs').insert({
                        user_id: sub.user_id,
                        type: 'grace_period_warning',
                        status: 'opt_out',
                        metadata: { reason: 'user_disabled' }
                    });
                    results.skipped++;
                    continue;
                }

                // Get email
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('email, full_name')
                    .eq('id', sub.user_id)
                    .single();

                if (!profile?.email) continue;

                // Send Email
                try {
                    await resend.emails.send({
                        from: EMAIL_FROM,
                        to: profile.email,
                        subject: 'Lembrete: Seu acesso premium expira em breve',
                        html: `<h1>Olá, ${profile.full_name || 'Assinante'}</h1>
                       <p>Este é um lembrete amigável de que o pagamento da sua assinatura ainda está pendente.</p>
                       <p>Para garantir que você <strong>não perca o acesso</strong> aos prontuários, agendamentos e outros dados importantes, regularize sua situação nos próximos 3 dias.</p>
                       <p>Estamos aqui para apoiar sua prática clínica.</p>
                       <p><a href="https://149psi.com.br/subscription">Manter meu Acesso</a></p>`
                    });

                    await supabaseClient.from('communication_logs').insert({
                        user_id: sub.user_id,
                        type: 'grace_period_warning',
                        status: 'sent',
                        metadata: { triggered_at: new Date().toISOString() }
                    });
                    results.sent++;

                } catch (err) {
                    console.error(err);
                    results.errors++;
                }
            }
        }

        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
});
