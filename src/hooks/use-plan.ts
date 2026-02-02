
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "./use-subscription";
import { isAccessBlocked } from "@/lib/subscription-utils";

export interface Plan {
    plan_key: string;
    name: string;
    price_brl: number;
    limits: Record<string, number>;
    features: string[];
}

export function usePlan() {
    const { data: subscription, isLoading: isLoadingSub } = useSubscription();

    const { data: plan, isLoading: isLoadingPlan } = useQuery({
        queryKey: ["plan", subscription?.plan],
        queryFn: async () => {
            if (!subscription) return null;

            // Check if access is blocked (e.g. past_due + grace period expired, or canceled)
            if (isAccessBlocked(subscription as any)) {
                return null;
            }

            if (!subscription.plan) return null;

            const { data, error } = await supabase
                .from("plans")
                .select("*")
                .eq("plan_key", subscription.plan)
                .single();

            if (error) return null;
            return data as Plan;
        },
        enabled: !!subscription,
    });

    const canAddPatient = (currentCount: number) => {
        if (!plan) return false;
        const limit = plan.limits?.patients;
        if (limit === undefined) return true; // Unlimited if not specified? Or block?
        // Assuming limit is number.
        return currentCount < limit;
    };

    return {
        plan,
        subscription,
        isLoading: isLoadingSub || isLoadingPlan,
        canAddPatient,
    };
}
