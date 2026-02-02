
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSubscription() {
    return useQuery({
        queryKey: ["subscription"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from("subscriptions")
                .select("*")
                // .eq("user_id", user.id) is already above
                .in("status", ["active", "past_due", "canceled", "trialing"])
                .maybeSingle();

            if (error) {
                console.error("Error fetching subscription:", error);
                return null;
            }

            return data;
        },
    });
}
