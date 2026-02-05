import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Heart,
  Calendar,
  TrendingUp,
  BookOpen,
  ClipboardList,
  Clock,
  ArrowRight,
  Smile,
  Frown,
  Meh,
  PlusCircle,
} from 'lucide-react';

// Mock data for UI demonstration
const recentMoods = [
  { day: 'Seg', mood: 'good', icon: Smile },
  { day: 'Ter', mood: 'neutral', icon: Meh },
  { day: 'Qua', mood: 'good', icon: Smile },
  { day: 'Qui', mood: 'bad', icon: Frown },
  { day: 'Sex', mood: 'good', icon: Smile },
  { day: 'Sáb', mood: 'neutral', icon: Meh },
  { day: 'Dom', mood: 'good', icon: Smile },
];

const moodColors = {
  good: 'text-green-500 bg-green-50 dark:bg-green-900/10',
  neutral: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
  bad: 'text-red-500 bg-red-50 dark:bg-red-900/10',
};

const PatientDashboard = () => {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'Paciente';

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, {firstName} 🌿
        </h1>
        <p className="text-muted-foreground">
          Vamos cuidar de você hoje?
        </p>
      </div>

      {/* Primary Action - Mobile First Hero */}
      <section>
        <Card className="bg-primary/5 border-primary/20 shadow-none">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Heart className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Como você está agora?</h2>
              <p className="text-muted-foreground text-sm">
                Tirar um momento para entender o que sente é o primeiro passo.
              </p>
            </div>
            <Button asChild size="lg" className="w-full h-14 text-lg rounded-xl shadow-sm mt-2">
              <Link to="/patient/checkin">
                <PlusCircle className="mr-2 h-5 w-5" />
                Fazer Check-in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Stats - Horizontal Scroll on Mobile for compactness, Grid on Desktop */}
      <section className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[max-content] sm:min-w-0">
          <div className="w-[160px] sm:w-auto">
            <StatCard
              icon={Calendar}
              title="Próxima Sessão"
              value="Quinta, 15h"
              description="Em 2 dias"
            />
          </div>
          <div className="w-[160px] sm:w-auto">
            <StatCard
              icon={TrendingUp}
              title="Sequência"
              value="7 dias"
              description="Continue assim!"
              trend={{ value: 100, isPositive: true }}
            />
          </div>
          <div className="w-[160px] sm:w-auto">
            <StatCard
              icon={BookOpen}
              title="Diário"
              value="12"
              description="Registros este mês"
            />
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Mood Summary */}
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Sua Semana</CardTitle>
            <CardDescription>Como você tem se sentido nos últimos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end gap-2 overflow-x-auto pb-2 scrollbar-none">
              {recentMoods.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 min-w-[45px]">
                  <div className={`p-3 rounded-2xl ${moodColors[item.mood as keyof typeof moodColors]} transition-transform active:scale-95`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Large Touch Targets */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg px-1">Explorar</h3>

          <Link to="/patient/diary" className="block">
            <div className="bg-card hover:bg-muted/50 border border-border/60 p-4 rounded-xl flex items-center justify-between transition-colors h-16 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-medium">Diário Emocional</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Link>

          <Link to="/patient/questionnaires" className="block">
            <div className="bg-card hover:bg-muted/50 border border-border/60 p-4 rounded-xl flex items-center justify-between transition-colors h-16 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-purple-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <span className="font-medium">Questionários</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Link>

          <Link to="/patient/timeline" className="block">
            <div className="bg-card hover:bg-muted/50 border border-border/60 p-4 rounded-xl flex items-center justify-between transition-colors h-16 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg text-orange-600">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="font-medium">Linha do Tempo</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Link>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 flex flex-col gap-3 border border-primary/10">
        <p className="font-medium text-lg text-foreground italic">
          "Cada passo conta na sua jornada de autoconhecimento."
        </p>
        <p className="text-sm text-muted-foreground">
          Lembre-se: não há pressa para se sentir bem.
        </p>
      </div>
    </div>
  );
};

export default PatientDashboard;

