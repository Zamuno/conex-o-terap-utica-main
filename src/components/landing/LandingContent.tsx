import { Shield, Users, HeartHandshake, Sparkles } from "lucide-react";
import { FeatureCard } from "@/components/landing/FeatureCard";

export const LandingContent = () => {
    const cards = [
        {
            icon: Shield,
            title: "Ambiente Seguro",
            description: "Seus dados estão protegidos. Seguimos rigorosamente a LGPD e garantimos total privacidade.",
        },
        {
            icon: Users,
            title: "Conexão com Profissionais",
            description: "Psicólogos verificados e comprometidos com a ética profissional.",
        },
        {
            icon: HeartHandshake,
            title: "Apoio em Momentos Difíceis",
            description: "Um espaço seguro para registrar o que você sente e compartilhar no seu tempo.",
        },
        {
            icon: Sparkles,
            title: "Transparência e Limites",
            description: "Uma plataforma que respeita seu ritmo, complementando o cuidado profissional.",
        },
    ];

    return (
        <div className="w-full max-w-lg p-6 lg:p-8 flex flex-col justify-center h-full max-h-screen">
            <div className="space-y-6 lg:space-y-8">
                <div className="space-y-3">
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground/90 leading-tight">
                        Cuidado terapêutico que continua entre as sessões
                    </h2>
                    <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                        O 149PSI conecta você ao seu bem-estar com segurança, ética e acolhimento.
                    </p>
                </div>

                <div className="grid gap-3 lg:gap-4">
                    {cards.map((card, index) => (
                        <FeatureCard
                            key={index}
                            {...card}
                            className="animate-in fade-in slide-in-from-bottom-4 transition-all"
                            style={{ animationDelay: `${index * 100}ms` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
