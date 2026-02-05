import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    Home,
    BookOpen,
    User,
    Stethoscope,
    Menu
} from 'lucide-react';

const mobileNavItems = [
    { icon: Home, label: 'Início', path: '/patient' },
    { icon: BookOpen, label: 'Diário', path: '/patient/diary' },
    { icon: Stethoscope, label: 'Terapia', path: '/patient/therapist' },
    { icon: Menu, label: 'Menu', path: '/patient/profile' },
];

export function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden">
            <div className="flex justify-around items-center h-16">
                {mobileNavItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/patient' && location.pathname.startsWith(item.path));

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-6 w-6 transition-all duration-200",
                                    isActive ? "fill-current scale-110" : "scale-100"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
