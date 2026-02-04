import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const FeatureCard = ({ icon: Icon, title, description, className, ...props }: FeatureCardProps) => {
    return (
        <div className={cn(
            "group flex flex-col gap-2 p-4 rounded-xl transition-all duration-300",
            "bg-white/60 hover:bg-white/90 border border-transparent hover:border-primary/10",
            "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
            className
        )} {...props}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-foreground/90 text-sm">{title}</h3>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed pl-[2.75rem]">
                {description}
            </p>
        </div>
    );
};
