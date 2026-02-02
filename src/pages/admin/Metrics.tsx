
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Users, Ticket } from "lucide-react";
import { THERAPIST_PLANS, PATIENT_PLANS } from "@/config/plans";

// Combine plans to map prices
const ALL_PLANS_MAP = [...THERAPIST_PLANS, ...PATIENT_PLANS].reduce((acc, plan) => {
    acc[plan.plan_key] = plan.price;
    return acc;
}, {} as Record<string, number>);

interface MetricsData {
    subscription_metrics: {
        plan_counts: Record<string, number>;
        total_active: number;
        churn_last_30d: number;
    };
    coupons: Array<{
        code: string;
        type: 'percentage' | 'fixed_amount';
        value: number;
        origin: string;
        redemptions: number;
        status: string;
        created: number;
    }>;
}

export default function AdminMetrics() {
    const { data: metrics, isLoading, error } = useQuery({
        queryKey: ["admin-metrics"],
        queryFn: async () => {
            const { data, error } = await supabase.functions.invoke<MetricsData>("get-admin-metrics");
            if (error) throw error;
            return data;
        },
    });

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Erro ao carregar métricas: {(error as Error).message}</div>;
    }

    // Calculate MRR
    let totalMRR = 0;
    if (metrics?.subscription_metrics?.plan_counts) {
        Object.entries(metrics.subscription_metrics.plan_counts).forEach(([planKey, count]) => {
            const price = ALL_PLANS_MAP[planKey] || 0;
            totalMRR += price * count;
        });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Métricas Unificadas</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR (Receita Recorrente)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Baseado em {metrics?.subscription_metrics?.total_active || 0} assinaturas ativas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Churn Mensal (30 dias)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {metrics?.subscription_metrics?.churn_last_30d || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cancelamentos no último mês
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cupons Ativos</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics?.coupons?.filter(c => c.status === 'active').length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Campanhas vigentes
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Cupons e Parcerias (Stripe)</h2>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Origem</TableHead>
                                <TableHead>Redemptions</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics?.coupons?.map((coupon) => (
                                <TableRow key={coupon.code}>
                                    <TableCell className="font-mono">{coupon.code}</TableCell>
                                    <TableCell>
                                        {coupon.type === 'percentage'
                                            ? `${coupon.value}% OFF`
                                            : `R$ ${(coupon.value / 100).toFixed(2)} OFF`}
                                    </TableCell>
                                    <TableCell className="capitalize">{coupon.origin || '-'}</TableCell>
                                    <TableCell>{coupon.redemptions}</TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                                            {coupon.status === 'active' ? 'Ativo' : 'Expirado'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!metrics?.coupons?.length && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Nenhum cupom encontrado</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
