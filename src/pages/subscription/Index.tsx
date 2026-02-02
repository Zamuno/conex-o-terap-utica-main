
import { useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { PricingCard } from "@/components/subscription/PricingCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { THERAPIST_PLANS } from "@/config/plans";

export default function SubscriptionPage() {
    const { data: subscription, isLoading } = useSubscription();
    const [loadingObj, setLoadingObj] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    // Cast subscription to any to access status safely if typing is strict
    const subStatus = (subscription as any)?.status;
    const isPastDue = subStatus === 'past_due';

    const handleSubscribe = async (plan: any) => {
        const priceId = plan.price_id;
        try {
            setLoadingObj(prev => ({ ...prev, [priceId]: true }));
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast({ title: "Erro", description: "Faça login para assinar.", variant: "destructive" });
                return;
            }

            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    price_id: priceId,
                    success_url: `${window.location.origin}/subscription/success`,
                    cancel_url: `${window.location.origin}/subscription`,
                }
            });

            if (error) throw error;
            if (data?.url) window.location.href = data.url;

        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setLoadingObj(prev => ({ ...prev, [priceId]: false }));
        }
    };

    const handlePortal = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('customer-portal', {
                body: { return_url: window.location.href }
            });
            if (error) throw error;
            if (data?.url) window.location.href = data.url;
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    if (isLoading) return <div>Carregando...</div>;

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-2">Assinatura</h1>
            <p className="text-muted-foreground mb-8">Gerencie seu plano e cobrança.</p>

            {subscription && (
                <div className="bg-muted p-4 rounded-lg mb-8 flex items-center justify-between">
                    <div>
                        <p className="font-medium">Plano Atual: <span className="capitalize">{subscription.plan || "Gratuito"}</span></p>
                        <p className="text-sm text-muted-foreground">Status: {subStatus}</p>
                    </div>
                    <Button onClick={handlePortal} variant="outline">Gerenciar Assinatura</Button>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {THERAPIST_PLANS.map(plan => (
                    <PricingCard
                        key={plan.plan_key}
                        plan={plan}
                        isCurrentPlan={subscription?.plan === plan.plan_key}
                        onSelect={handleSubscribe}
                        isLoading={loadingObj[plan.price_id]}
                        disabled={subscription?.plan === plan.plan_key || isPastDue}
                    />
                ))}
            </div>
        </div>
    );
}
