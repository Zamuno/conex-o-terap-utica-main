
import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="bg-muted py-8 mt-auto border-t">
            <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} 149Psi. Todos os direitos reservados.
                </div>
                <div className="flex gap-6 text-sm font-medium">
                    <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                        Termos de Uso
                    </Link>
                    <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                        Política de Privacidade
                    </Link>
                    <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                        FAQ
                    </Link>
                    <button
                        onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                        Preferências de Cookies
                    </button>
                </div>
            </div>
        </footer>
    );
};
