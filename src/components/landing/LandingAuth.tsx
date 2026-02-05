import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Eye, EyeOff, ArrowLeft, Heart, Sparkles, User, Stethoscope } from "lucide-react";

type AuthView = 'hero' | 'login' | 'register_role' | 'register_form';

export const LandingAuth = () => {
    const { signInWithGoogle, signIn, signUp, user, role, loading: authLoading, isRoleLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // View State Management
    const [view, setView] = useState<AuthView>('hero');
    const [loading, setLoading] = useState(false);

    // Form States
    const [showEmailForm, setShowEmailForm] = useState(false); // Used inside generic forms for email toggle
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<"patient" | "therapist" | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (authLoading || isRoleLoading) return;

        if (user) {
            if (role) {
                const paths = { patient: '/patient', therapist: '/therapist', admin: '/admin' };
                navigate(paths[role], { replace: true });
            } else {
                navigate('/onboarding/role', { replace: true });
            }
        }
    }, [user, role, authLoading, isRoleLoading, navigate]);

    const savePendingRole = () => {
        if (selectedRole) {
            localStorage.setItem('pendingRole', selectedRole);
        } else {
            localStorage.removeItem('pendingRole');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            if (view === 'register_form' && !selectedRole) {
                toast({ variant: "destructive", title: "Erro de validação", description: "Role não selecionada." });
                return;
            }
            if (view === 'register_form') savePendingRole();

            setLoading(true);
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao autenticar com Google",
                description: error.message,
            });
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (view === 'register_form') {
            // Registration Validation
            if (!email || !password || !fullName || !confirmPassword) {
                toast({ variant: "destructive", title: "Preencha todos os campos" });
                return;
            }
            if (!selectedRole) {
                toast({ variant: "destructive", title: "Função não selecionada" });
                return;
            }
            if (password !== confirmPassword) {
                toast({ variant: "destructive", title: "As senhas não conferem" });
                return;
            }
            if (password.length < 8) {
                toast({ variant: "destructive", title: "A senha deve ter pelo menos 8 caracteres" });
                return;
            }

            try {
                setLoading(true);
                savePendingRole();

                const { error } = await signUp(email, password, fullName);
                if (error) throw error;

                toast({
                    title: "Conta criada com sucesso!",
                    description: "Verifique seu email para confirmar o cadastro.",
                });
                // Return to hero or login
                setView('login');
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Erro ao criar conta",
                    description: error.message,
                });
            } finally {
                setLoading(false);
            }

        } else {
            // Login Logic
            if (!email || !password) return;

            try {
                setLoading(true);
                const { error } = await signIn(email, password);
                if (error) throw error;

                toast({
                    title: "Bem-vindo(a) de volta!",
                    description: "Login realizado com sucesso.",
                });
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Erro ao entrar",
                    description: error.message === 'Invalid login credentials'
                        ? 'Email ou senha incorretos'
                        : error.message,
                });
                setLoading(false);
            }
        }
    };

    // --- Sub-components (Views) ---

    // 1. Hero View
    const HeroView = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl shadow-sm">
                        ψ
                    </div>
                    <span className="text-3xl font-bold tracking-tight text-foreground/90">149PSI</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                    Cuidar de si <br className="hidden lg:block" /> nunca foi tão simples.
                </h1>
                <p className="text-muted-foreground text-lg lg:text-xl max-w-md mx-auto lg:mx-0 leading-relaxed">
                    Sua jornada de saúde mental com segurança, privacidade e acolhimento.
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <Button
                    className="w-full h-14 rounded-2xl text-lg font-medium shadow-md hover:shadow-lg transition-all"
                    onClick={() => setView('login')}
                >
                    Entrar
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl text-lg font-medium border-2 hover:bg-muted/30 transition-all"
                    onClick={() => setView('register_role')}
                >
                    Criar conta
                </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground/60 pt-4">
                Plataforma ética e segura para pacientes e terapeutas.
            </p>
        </div>
    );

    // 2. Role Selection View
    const RoleSelectionView = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <button
                onClick={() => setView('hero')}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors -ml-2 p-2"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </button>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Como você está usando o 149PSI hoje?</h2>
                <p className="text-muted-foreground text-lg">Selecione o perfil que melhor se adapta a você.</p>
            </div>

            <div className="grid gap-4">
                <button
                    onClick={() => { setSelectedRole('patient'); setView('register_form'); }}
                    className="flex items-center gap-4 p-6 rounded-2xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left"
                >
                    <div className="h-14 w-14 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <User className="h-7 w-7" />
                    </div>
                    <div>
                        <span className="block text-xl font-semibold text-foreground">Sou Paciente</span>
                        <span className="text-muted-foreground">Busco terapia e autoconhecimento</span>
                    </div>
                </button>

                <button
                    onClick={() => { setSelectedRole('therapist'); setView('register_form'); }}
                    className="flex items-center gap-4 p-6 rounded-2xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left"
                >
                    <div className="h-14 w-14 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <Stethoscope className="h-7 w-7" />
                    </div>
                    <div>
                        <span className="block text-xl font-semibold text-foreground">Sou Terapeuta</span>
                        <span className="text-muted-foreground">Sou profissional de psicologia</span>
                    </div>
                </button>
            </div>
        </div>
    );

    // 3. Login & Register Forms
    // Shared Logic Wrapper for Form
    const AuthFormView = () => {
        const isRegister = view === 'register_form';

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <button
                    onClick={() => setView(isRegister ? 'register_role' : 'hero')}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors -ml-2 p-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </button>

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isRegister
                            ? (selectedRole === 'patient' ? "Conta Paciente" : "Conta Terapeuta")
                            : "Bem-vindo de volta"
                        }
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        {isRegister
                            ? "Preencha seus dados para começar."
                            : "Acesse sua conta para continuar."
                        }
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="w-full h-14 rounded-xl relative bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm font-medium text-base transition-all"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        {loading && !authLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        )}
                        Continuar com Google
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-4 text-muted-foreground/80 font-medium">
                                ou
                            </span>
                        </div>
                    </div>

                    {!showEmailForm && !email ? (
                        <Button
                            variant="secondary"
                            className="w-full h-14 rounded-xl font-medium text-base bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground transition-all"
                            onClick={() => setShowEmailForm(true)}
                            disabled={loading}
                        >
                            <Mail className="mr-2 h-5 w-5" />
                            {isRegister ? "Cadastrar com Email" : "Entrar com Email"}
                        </Button>
                    ) : (
                        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            {isRegister && (
                                <Input
                                    placeholder="Nome Completo"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={loading}
                                    required
                                    className="h-14 rounded-xl bg-muted/30 border-border/60 focus:bg-background text-lg"
                                />
                            )}
                            <Input
                                type="email"
                                placeholder="Seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                                className="h-14 rounded-xl bg-muted/30 border-border/60 focus:bg-background text-lg"
                            />

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                    className="h-14 rounded-xl bg-muted/30 border-border/60 focus:bg-background pr-12 text-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground p-1 h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {isRegister && (
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirme a senha"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="h-14 rounded-xl bg-muted/30 border-border/60 focus:bg-background pr-12 text-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground p-1 h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            )}

                            <Button type="submit" className="w-full h-14 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transition-all mt-2" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {isRegister ? "Concluir Cadastro" : "Acessar Conta"}
                            </Button>
                        </form>
                    )}

                    {!isRegister && !showEmailForm && (
                        <div className="text-center pt-2">
                            <Button
                                variant="link"
                                className="text-muted-foreground hover:text-primary transition-colors h-auto p-0"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Esqueceu sua senha?
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="flex flex-col justify-center min-h-[80vh] lg:min-h-screen px-4 lg:px-16 py-8 w-full max-w-md mx-auto lg:max-w-md">
            {view === 'hero' && <HeroView />}
            {view === 'register_role' && <RoleSelectionView />}
            {(view === 'login' || view === 'register_form') && <AuthFormView />}
        </div>
    );
};
