import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    Home,
    BookOpen,
    Stethoscope,
    Menu
} from 'lucide-react';

const mobileNavItems = [
    { icon: Home, label: 'Início', path: '/patient' },
    { icon: BookOpen, label: 'Diário', path: '/patient/diary' },
    { icon: Stethoscope, label: 'Terapia', path: '/patient/therapist' },
    { icon: Menu, label: 'Menu', path: '/patient/menu' },
];

export function BottomNavigation() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-background border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16">
                {mobileNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 tap-highlight-transparent",
                            isActive
                                ? "text-primary scale-105 font-medium"
                                : "text-muted-foreground hover:text-foreground active:scale-95"
                        )}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    className={cn(
                                        "h-6 w-6 transition-all",
                                        isActive ? "fill-current" : ""
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="text-[10px]">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
