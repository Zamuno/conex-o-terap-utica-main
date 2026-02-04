import { useState } from 'react';
import { LandingAuth } from '@/components/landing/LandingAuth';
import { LandingContent } from '@/components/landing/LandingContent';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-background to-muted/20">
      {/* Coluna Esquerda - Autenticação */}
      <div className="order-1 flex flex-col justify-center relative z-10 p-4 lg:p-0">
        <LandingAuth />

        {/* Mobile Only: Toggle for Content */}
        <div className="lg:hidden w-full max-w-sm mx-auto mt-4 px-4 pb-8">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between text-muted-foreground hover:text-primary hover:bg-primary/5 group"
            onClick={() => setShowContent(!showContent)}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary/70" />
              Por que usar o 149PSI?
            </span>
            {showContent ? (
              <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            )}
          </Button>

          <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${showContent ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
            }`}>
            <div className="min-h-0">
              <div className="p-4 rounded-2xl bg-white/50 border border-border/40 shadow-sm">
                <LandingContent />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Direita - Contexto/Confiança (Desktop) */}
      <div className="hidden lg:flex order-2 sticky top-0 h-screen items-center justify-center bg-muted/30 border-l border-white/20 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.03)]">
        <LandingContent />
      </div>
    </div>
  );
};

export default Landing;


