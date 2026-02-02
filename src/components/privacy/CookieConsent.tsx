
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Cookie, Shield, BarChart, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CookiePreferences {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
}

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        analytics: false,
        marketing: false,
    });
    const { toast } = useToast();

    useEffect(() => {
        // Check local storage on mount
        const savedConsent = localStorage.getItem('cookie_consent');
        if (!savedConsent) {
            setIsVisible(true);
        } else {
            try {
                setPreferences(JSON.parse(savedConsent));
            } catch (e) {
                setIsVisible(true);
            }
        }

        // Listener to re-open settings
        const handleOpenSettings = () => setIsSettingsOpen(true);
        window.addEventListener('open-cookie-settings', handleOpenSettings);
        return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
    }, []);

    const saveConsent = async (newPreferences: CookiePreferences) => {
        // 1. Save to Local Storage
        localStorage.setItem('cookie_consent', JSON.stringify(newPreferences));
        localStorage.setItem('cookie_consent_date', new Date().toISOString());
        setPreferences(newPreferences);
        setIsVisible(false);
        setIsSettingsOpen(false);

        // 2. Apply Logic (Example: Enable/Disable Analytics)
        if (newPreferences.analytics) {
            console.log('Analytics Enabled');
            // Initialize GA/Pixel here if needed
        } else {
            console.log('Analytics Disabled');
            // Disable GA/Pixel here
        }

        // 3. Sync with Supabase (if logged in)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            try {
                // Log analytics consent
                if (newPreferences.analytics) {
                    await supabase.from('user_consents').insert({
                        user_id: session.user.id,
                        type: 'cookie_analytics',
                        version: '1.0',
                        status: 'accepted',
                        ip_address: 'client-side', // Backend should ideally capture this
                        user_agent: navigator.userAgent
                    });
                }
                // Log marketing consent
                if (newPreferences.marketing) {
                    await supabase.from('user_consents').insert({
                        user_id: session.user.id,
                        type: 'cookie_marketing',
                        version: '1.0',
                        status: 'accepted',
                        ip_address: 'client-side',
                        user_agent: navigator.userAgent
                    });
                }
            } catch (error) {
                console.error('Error syncing consent:', error);
            }
        }

        toast({
            title: "Preferências Salvas",
            description: "Suas escolhas de privacidade foram atualizadas.",
        });
    };

    const handleAcceptAll = () => {
        saveConsent({ essential: true, analytics: true, marketing: true });
    };

    const handleReject = () => {
        saveConsent({ essential: true, analytics: false, marketing: false });
    };

    const handleSaveSettings = () => {
        saveConsent(preferences);
    };

    if (!isVisible && !isSettingsOpen) return null;

    return (
        <>
            {/* Banner Fixed Bottom */}
            {isVisible && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 shadow-lg animate-in slide-in-from-bottom-full duration-500">
                    <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 font-semibold">
                                <Cookie className="h-5 w-5 text-primary" />
                                <span>Política de Cookies</span>
                            </div>
                            <p className="text-sm text-muted-foreground w-full md:w-3/4">
                                Usamos cookies para melhorar sua experiência e entender como você usa nossa plataforma.
                                Cookies essenciais são sempre ativos. Para saber mais, acesse nossa{' '}
                                <a href="/privacy" className="underline hover:text-primary">Política de Privacidade</a>.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                                Configurar
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleReject}>
                                Apenas Essenciais
                            </Button>
                            <Button size="sm" onClick={handleAcceptAll}>
                                Aceitar Tudo
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Preferências de Cookies</DialogTitle>
                        <DialogDescription>
                            Gerencie suas configurações de privacidade. Cookies essenciais não podem ser desativados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Essential */}
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 opacity-50 cursor-not-allowed bg-muted/50">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> Essenciais
                                </label>
                                <p className="text-xs text-muted-foreground">Necessários para o site funcionar (segurança, login).</p>
                            </div>
                            <Switch checked={true} disabled />
                        </div>

                        {/* Analytics */}
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <BarChart className="h-4 w-4" /> Analíticos
                                </label>
                                <p className="text-xs text-muted-foreground">Nos ajudam a entender como você usa o site.</p>
                            </div>
                            <Switch
                                checked={preferences.analytics}
                                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
                            />
                        </div>

                        {/* Marketing */}
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Info className="h-4 w-4" /> Marketing
                                </label>
                                <p className="text-xs text-muted-foreground">Usados para oferecer conteúdo relevante.</p>
                            </div>
                            <Switch
                                checked={preferences.marketing}
                                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveSettings}>Salvar Preferências</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
