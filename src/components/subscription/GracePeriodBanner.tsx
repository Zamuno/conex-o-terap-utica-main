
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { useCheckout } from '@/hooks/useCheckout';
import { isInGracePeriod, getGracePeriodDaysRemaining } from '@/lib/subscription-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const GracePeriodBanner: React.FC = () => {
    const { data: subscription } = useSubscription();
    const { openCustomerPortal, isLoading } = useCheckout();

    // Cast to expected type as Supabase returns string
    const typedSubscription = subscription as any;

    if (!subscription || !isInGracePeriod(typedSubscription)) {
        return null;
    }

    const daysRemaining = getGracePeriodDaysRemaining(typedSubscription);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800 shadow-sm animate-in slide-in-from-top duration-300">
            <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                            Mantenha seu acesso premium
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Não perca o acesso aos seus pacientes. Atualize seu pagamento para continuar aproveitando o plano (Restam {daysRemaining} dias).
                        </p>
                    </div>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white whitespace-nowrap"
                    onClick={() => openCustomerPortal()}
                    disabled={isLoading}
                >
                    {isLoading ? "Carregando..." : "Atualizar agora"}
                </Button>
            </div>
        </div>
    );
};
