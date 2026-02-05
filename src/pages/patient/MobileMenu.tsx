import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Heart,
    BookOpen,
    FileText,
    ClipboardList,
    History,
    Clock,
    User,
    LogOut,
    Stethoscope,
    TrendingUp,
    UserPen,
    ClipboardPlus,
    Search,
    ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/patient', description: 'Visão geral do seu dia' },
    { icon: Search, label: 'Encontrar Terapeuta', path: '/patient/find-therapist', description: 'Busque profissionais qualificados' },
    { icon: Stethoscope, label: 'Meu Terapeuta', path: '/patient/therapist', description: 'Sessões e chat' },
    { icon: BookOpen, label: 'Diário', path: '/patient/diary', description: 'Seus registros pessoais' },
    { icon: Heart, label: 'Fazer Check-in', path: '/patient/checkin', description: 'Como você está se sentindo?' },
    { icon: TrendingUp, label: 'Histórico de Humor', path: '/patient/checkin-history', description: 'Acompanhe sua evolução' },
    { icon: ClipboardPlus, label: 'Ficha Inicial', path: '/patient/intake', description: 'Seus dados de triagem' },
    { icon: UserPen, label: 'Sobre Mim', path: '/patient/self-view', description: 'Sua auto-percepção' },
    { icon: FileText, label: 'Registros Emocionais', path: '/patient/records', description: 'Detalhes dos seus sentimentos' },
    { icon: ClipboardList, label: 'Questionários', path: '/patient/questionnaires', description: 'Testes e avaliações' },
    { icon: History, label: 'Minha História', path: '/patient/history', description: 'Sua jornada de vida' },
    { icon: Clock, label: 'Linha do Tempo', path: '/patient/timeline', description: 'Eventos marcantes' },
    { icon: User, label: 'Meu Perfil', path: '/patient/profile', description: 'Configurações e assinatura' },
];

export default function MobileMenu() {
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="pb-20 space-y-6 animate-in slide-in-from-right duration-300">
            <PageHeader
                title="Menu Principal"
                description={`Olá, ${profile?.full_name?.split(' ')[0] || 'Paciente'}`}
            />

            <div className="grid gap-3">
                {menuItems.map((item, index) => (
                    <Link key={index} to={item.path}>
                        <Card className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">{item.label}</h3>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="pt-6 border-t border-border">
                <Button
                    variant="destructive"
                    className="w-full h-12 rounded-xl text-base"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sair da Conta
                </Button>
            </div>
        </div>
    );
}
