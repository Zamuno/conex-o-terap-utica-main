import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  Heart,
  CalendarClock,
  FileText,
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const TherapistDashboard = () => {
  const { profile, user } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'Terapeuta';

  // Fetch active patients count
  const { data: activePatientsCount = 0 } = useQuery({
    queryKey: ['therapist-stats-patients', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('patient_therapist_relations')
        .select('*', { count: 'exact', head: true })
        .eq('therapist_id', user!.id)
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch today's sessions
  const { data: todaySessions = [], isLoading: loadingToday } = useQuery({
    queryKey: ['therapist-today-sessions', user?.id],
    queryFn: async () => {
      const today = new Date();

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey (full_name)
        `)
        .eq('therapist_id', user!.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', startOfDay(today).toISOString())
        .lte('scheduled_at', endOfDay(today).toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions = [] } = useQuery({
    queryKey: ['therapist-upcoming-sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey (full_name)
        `)
        .eq('therapist_id', user!.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch check-ins received in last 7 days
  const { data: recentCheckInsCount = 0 } = useQuery({
    queryKey: ['therapist-checkins-received', user?.id],
    queryFn: async () => {
      // First get all patient IDs
      const { data: relations } = await supabase
        .from('patient_therapist_relations')
        .select('patient_id')
        .eq('therapist_id', user!.id)
        .eq('status', 'active');

      if (!relations || relations.length === 0) return 0;

      const patientIds = relations.map((r) => r.patient_id);
      const sevenDaysAgo = subDays(new Date(), 7);

      const { count, error } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .in('user_id', patientIds)
        .eq('shared_with_therapist', true)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch patients needing attention (low engagement or no recent activity)
  const { data: alertPatients = [] } = useQuery({
    queryKey: ['therapist-alert-patients', user?.id],
    queryFn: async () => {
      const { data: relations } = await supabase
        .from('patient_therapist_relations')
        .select(`
          patient_id,
          profiles!patient_therapist_relations_patient_id_fkey (
            full_name
          )
        `)
        .eq('therapist_id', user!.id)
        .eq('status', 'active');

      if (!relations) return [];

      const fiveDaysAgo = subDays(new Date(), 5);
      const alerts: { id: string; patient: string; message: string }[] = [];

      for (const relation of relations) {
        const { data: lastCheckIn } = await supabase
          .from('check_ins')
          .select('created_at')
          .eq('user_id', relation.patient_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!lastCheckIn || new Date(lastCheckIn.created_at) < fiveDaysAgo) {
          alerts.push({
            id: relation.patient_id,
            patient: relation.profiles?.full_name || 'Paciente',
            message: lastCheckIn
              ? `Não fez check-in há ${Math.floor((Date.now() - new Date(lastCheckIn.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias`
              : 'Nenhum check-in registrado',
          });
        }
      }

      return alerts.slice(0, 5);
    },
    enabled: !!user,
  });

  // Calculate next session time
  const nextSessionTime = todaySessions.length > 0
    ? format(new Date(todaySessions[0].scheduled_at), 'HH:mm')
    : null;

  if (loadingToday) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PageHeader
        title={`Olá, ${firstName}!`}
        description="Resumo do seu dia profissional."
      />

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Pacientes Ativos"
          value={activePatientsCount.toString()}
          description="Total vinculados"
        />
        <StatCard
          icon={Calendar}
          title="Sessões Hoje"
          value={todaySessions.length.toString()}
          description={nextSessionTime ? `Próxima: ${nextSessionTime}` : 'Agenda livre'}
        />
        <StatCard
          icon={Heart}
          title="Novos Check-ins"
          value={recentCheckInsCount.toString()}
          description="Últimos 7 dias"
        />
        <StatCard
          icon={TrendingUp}
          title="Engajamento"
          value={activePatientsCount > 0 ? `${Math.min(100, Math.round((recentCheckInsCount / (activePatientsCount * 7)) * 100))}%` : '0%'}
          description="Taxa Semanal"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Próximas Sessões</CardTitle>
                <CardDescription>Agenda recente</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-9">
                <Link to="/therapist/schedule">
                  Ver Agenda
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base">
                          {session.profiles?.full_name || 'Paciente'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.session_type === 'online' ? 'Online' : 'Presencial'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base">
                        {format(new Date(session.scheduled_at), 'HH:mm')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.scheduled_at), "d 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma sessão agendada.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts - High Priority */}
        <Card className="shadow-sm border-amber-200/50 bg-amber-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Alertas <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                </CardTitle>
                <CardDescription>Pacientes que precisam de atenção</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-9">
                <Link to="/therapist/patients">
                  Ver Todos
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {alertPatients.length > 0 ? (
              <div className="space-y-3">
                {alertPatients.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-amber-200/60 bg-white"
                  >
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm sm:text-base">{alert.patient}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum alerta no momento.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Large Touch Targets */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Gestão Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="h-14 justify-start px-4 text-base rounded-xl border-border/60 hover:bg-muted/50" asChild>
              <Link to="/therapist/patients">
                <Users className="mr-3 h-5 w-5 text-primary" />
                Meus Pacientes
              </Link>
            </Button>
            <Button variant="outline" className="h-14 justify-start px-4 text-base rounded-xl border-border/60 hover:bg-muted/50" asChild>
              <Link to="/therapist/notes">
                <FileText className="mr-3 h-5 w-5 text-primary" />
                Minhas Anotações
              </Link>
            </Button>
            <Button variant="outline" className="h-14 justify-start px-4 text-base rounded-xl border-border/60 hover:bg-muted/50" asChild>
              <Link to="/therapist/schedule">
                <CalendarClock className="mr-3 h-5 w-5 text-primary" />
                Gerenciar Agenda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapistDashboard;
