
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Download, Trash2, Shield, History, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivacyDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isExporting, setIsExporting] = useState(false);

    // Fetch Consents
    const { data: consents } = useQuery({
        queryKey: ['user_consents'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_consents')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    // Fetch Deletion Requests
    const { data: deletionRequest } = useQuery({
        queryKey: ['deletion_request'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('account_deletion_requests')
                .select('*')
                .eq('status', 'pending')
                .maybeSingle();
            if (error) throw error;
            return data;
        }
    });

    // Export Data Handler
    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const { data, error } = await supabase.functions.invoke('export-user-data', {
                method: 'POST',
            });

            if (error) throw error;

            // Create blob and download
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            toast({ title: 'Exportação concluída', description: 'Seus dados foram baixados com sucesso.' });
        } catch (err: any) {
            toast({ title: 'Erro na exportação', description: err.message, variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    // Request Deletion Handler
    const requestDeletion = async () => {
        if (!confirm('ATENÇÃO: A exclusão da conta é permanente. Deseja realmente solicitar a exclusão?')) return;

        try {
            const { error } = await supabase.from('account_deletion_requests').insert({
                user_id: user?.id,
                reason: 'User requested via Privacy Dashboard'
            });
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['deletion_request'] });
            toast({ title: 'Solicitação Enviada', description: 'Sua conta será excluída em até 30 dias.' });
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-8 animate-in fade-in">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    Privacidade e Seus Dados
                </h1>
                <p className="text-muted-foreground">
                    Gerencie seus consentimentos, exporte suas informações e exerça seus direitos garantidos pela LGPD.
                </p>
            </div>

            {/* Seção 1: Exportação de Dados */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Portabilidade de Dados
                    </CardTitle>
                    <CardDescription>
                        Você tem o direito de receber uma cópia de todos os seus dados pessoais armazenados em nossa plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleExportData} disabled={isExporting}>
                        {isExporting ? 'Processando...' : 'Baixar Meus Dados (JSON)'}
                    </Button>
                </CardContent>
            </Card>

            {/* Seção 2: Consentimentos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Meus Consentimentos
                    </CardTitle>
                    <CardDescription>
                        Histórico de termos e políticas que você aceitou.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <div className="grid grid-cols-4 p-4 font-medium bg-muted/50">
                            <div>Tipo</div>
                            <div>Versão</div>
                            <div>Data</div>
                            <div>Status</div>
                        </div>
                        <div className="divide-y">
                            {consents?.map((consent: any) => (
                                <div key={consent.id} className="grid grid-cols-4 p-4 text-sm items-center">
                                    <div className="capitalize">{consent.type.replace('_', ' ')}</div>
                                    <div>{consent.version}</div>
                                    <div>{format(new Date(consent.accepted_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                                    <div>
                                        {consent.revoked_at ? (
                                            <span className="flex items-center text-red-500 gap-1"><XCircle className="h-3 w-3" /> Revogado</span>
                                        ) : (
                                            <span className="flex items-center text-green-500 gap-1"><CheckCircle className="h-3 w-3" /> Ativo</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {!consents?.length && <div className="p-4 text-center text-muted-foreground">Nenhum registro encontrado.</div>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Seção 3: Exclusão (Danger Zone) */}
            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Trash2 className="h-5 w-5" />
                        Exclusão de Conta
                    </CardTitle>
                    <CardDescription>
                        Direito ao Esquecimento. Solicite a remoção permanente de seus dados.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant={deletionRequest ? "default" : "destructive"}>
                        <AlertTitle>Atenção</AlertTitle>
                        <AlertDescription>
                            A exclusão remove acesso a todos os serviços. Alguns dados fiscais podem ser mantidos por até 5 anos conforme exigido por lei.
                        </AlertDescription>
                    </Alert>

                    {deletionRequest ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 text-yellow-800 dark:text-yellow-200">
                            Uma solicitação de exclusão está <strong>{deletionRequest.status}</strong> (Solicitado em: {format(new Date(deletionRequest.requested_at), 'dd/MM/yyyy')}).
                        </div>
                    ) : (
                        <Button variant="destructive" onClick={requestDeletion}>
                            Solicitar Exclusão da Minha Conta
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
