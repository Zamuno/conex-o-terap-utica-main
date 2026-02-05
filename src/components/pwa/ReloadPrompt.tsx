import { useRegisterSW } from 'virtual:pwa-register/react';
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from 'react';

export const ReloadPrompt = () => {
    const { toast } = useToast();
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    useEffect(() => {
        if (offlineReady) {
            toast({
                title: "Aplicativo pronto para uso offline",
                description: "Agora você pode usar o app mesmo sem internet.",
                duration: 5000,
            });
            setOfflineReady(false);
        }
    }, [offlineReady, toast]);

    useEffect(() => {
        if (needRefresh) {
            toast({
                title: "Nova versão disponível",
                description: "Uma nova versão do app está disponível. Clique para atualizar.",
                duration: Infinity,
                action: (
                    <ToastAction altText="Atualizar" onClick={() => updateServiceWorker(true)}>
                        Atualizar
                    </ToastAction>
                ),
            });
        }
    }, [needRefresh, toast, updateServiceWorker]);

    return null;
};
