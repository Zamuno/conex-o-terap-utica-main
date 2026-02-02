
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminCompliance() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Deletion Requests
    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin_deletion_requests'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('account_deletion_requests')
                .select('*, profiles(email, full_name)')
                .order('requested_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    // Handle Request Mutation
    const mutation = useMutation({
        mutationFn: async ({ id, action }: { id: string, action: 'approve' | 'reject' }) => {
            const { error } = await supabase.functions.invoke('handle-deletion-request', {
                body: { requestId: id, action }
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_deletion_requests'] });
            toast({ title: 'Sucesso', description: 'Solicitação processada.' });
        },
        onError: (err: any) => {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        }
    });

    return (
        <div className="space-y-6 animate-in fade-in">
            <PageHeader
                title="Compliance & LGPD"
                description="Gestão de solicitações de privacidade e exclusão de dados."
            />

            <Tabs defaultValue="deletions">
                <TabsList>
                    <TabsTrigger value="deletions">Exclusão de Contas</TabsTrigger>
                    {/* Future: <TabsTrigger value="consents">Consentimentos</TabsTrigger> */}
                </TabsList>

                <TabsContent value="deletions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Solicitações de Exclusão</CardTitle>
                            <CardDescription>Gerencie pedidos de "Direito ao Esquecimento". A aprovação deleta a conta permanentemente.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <div className="grid grid-cols-5 p-4 font-medium bg-muted/50">
                                    <div>Usuário</div>
                                    <div>Data Solicitação</div>
                                    <div>Status</div>
                                    <div>Motivo</div>
                                    <div className="text-right">Ações</div>
                                </div>
                                <div className="divide-y relative min-h-[100px]">
                                    {isLoading && <div className="p-4 text-center">Carregando...</div>}
                                    {requests?.map((req: any) => (
                                        <div key={req.id} className="grid grid-cols-5 p-4 text-sm items-center">
                                            <div className="overflow-hidden">
                                                <p className="font-medium truncate">{req.profiles?.full_name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{req.profiles?.email}</p>
                                            </div>
                                            <div>{format(new Date(req.requested_at), 'dd/MM/yyyy', { locale: ptBR })}</div>
                                            <div>
                                                <Badge variant={req.status === 'pending' ? 'outline' : req.status === 'completed' ? 'secondary' : 'default'}>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                            <div className="truncate text-muted-foreground">{req.reason || '-'}</div>
                                            <div className="text-right flex justify-end gap-2">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-red-600"
                                                            onClick={() => {
                                                                if (confirm('Rejeitar solicitação?')) mutation.mutate({ id: req.id, action: 'reject' });
                                                            }}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => {
                                                                if (confirm('ATENÇÃO: Isso deletará a conta PERMANENTEMENTE. Confirmar?')) mutation.mutate({ id: req.id, action: 'approve' });
                                                            }}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {!requests?.length && !isLoading && <div className="p-4 text-center text-muted-foreground">Nenhuma solicitação encontrada.</div>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
