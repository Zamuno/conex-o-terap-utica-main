import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const Logs = () => {
  const [search, setSearch] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            actor:profiles!actor_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  const filteredLogs = logs?.filter((log: any) =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.actor?.email?.toLowerCase().includes(search.toLowerCase()) ||
    log.target_resource?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader title="Logs de Auditoria" description="Registro imutável de ações sensíveis no sistema." />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Histórico de Eventos</CardTitle>
              <CardDescription>Mostrando os últimos 100 registros.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar logs..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : (
            <div className="rounded-md border text-sm">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium bg-muted/50 border-b">
                <div className="col-span-2">Data/Hora</div>
                <div className="col-span-2">Ator</div>
                <div className="col-span-2">Ação</div>
                <div className="col-span-3">Alvo</div>
                <div className="col-span-3">IP / Metadados</div>
              </div>
              <div className="max-h-[600px] overflow-y-auto divide-y">
                {filteredLogs?.map((log: any) => (
                  <div key={log.id} className="grid grid-cols-12 gap-4 p-3 hover:bg-muted/10 transition-colors">
                    <div className="col-span-2 text-muted-foreground text-xs my-auto">
                      {format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: ptBR })}
                    </div>
                    <div className="col-span-2 truncate my-auto" title={log.actor?.email}>
                      {log.actor?.full_name || 'System'}
                    </div>
                    <div className="col-span-2 font-medium my-auto text-blue-600 dark:text-blue-400">
                      {log.action}
                    </div>
                    <div className="col-span-3 text-xs font-mono my-auto truncate" title={log.target_resource}>
                      {log.target_resource || '-'}
                    </div>
                    <div className="col-span-3 text-xs text-muted-foreground truncate my-auto">
                      <span className="mr-2">{log.ip_address}</span>
                      {log.metadata && JSON.stringify(log.metadata) !== '{}' && (
                        <span className="font-mono bg-muted px-1 rounded">{JSON.stringify(log.metadata).slice(0, 20)}...</span>
                      )}
                    </div>
                  </div>
                ))}
                {!filteredLogs?.length && <div className="p-8 text-center text-muted-foreground">Nenhum log encontrado.</div>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default Logs;
