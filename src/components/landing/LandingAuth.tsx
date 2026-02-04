import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";

export const LandingAuth = () => {
    const { signInWithGoogle, signIn, signUp, user, role, loading: authLoading, isRoleLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    // Form states
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
                // If user has no role, redirect to onboarding regardless of how they signed up
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
            if (isRegister && !selectedRole) {
                toast({ variant: "destructive", title: "Selecione se você é paciente ou terapeuta" });
                return;
            }
            // Save role preference if selected (even for login context if they switched toggles, though less critical)
            if (isRegister) savePendingRole();

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

        if (isRegister) {
            // Registration Logic
            if (!email || !password || !fullName || !confirmPassword) {
                toast({ variant: "destructive", title: "Preencha todos os campos" });
                return;
            }
            if (!selectedRole) {
                toast({ variant: "destructive", title: "Selecione se você é paciente ou terapeuta" });
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
            if (!/[A-Z]/.test(password)) {
                toast({ variant: "destructive", title: "A senha deve conter pelo menos uma letra maiúscula" });
                return;
            }
            if (!/[a-z]/.test(password)) {
                toast({ variant: "destructive", title: "A senha deve conter pelo menos uma letra minúscula" });
                return;
            }
            if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
                toast({ variant: "destructive", title: "A senha deve conter pelo menos um número ou símbolo" });
                return;
            }

            try {
                setLoading(true);
                savePendingRole(); // Save role for the onboarding page to pick up

                const { error } = await signUp(email, password, fullName);
                if (error) throw error;

                toast({
                    title: "Conta criada com sucesso!",
                    description: "Verifique seu email para confirmar o cadastro.",
                });
                // Optionally reset form or switch to login mode, but usually standard is to wait for email usage
                setIsRegister(false);
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

    const toggleMode = () => {
        setIsRegister(!isRegister);
        // Reset sensitive fields/errors if any, keep email optionally
        setPassword("");
        setConfirmPassword("");
        setSelectedRole(null);
    };

    return (
        <div className="flex flex-col justify-center min-h-[50vh] lg:min-h-screen p-6 lg:p-16 animate-in fade-in duration-700">
            <div className="w-full max-w-sm mx-auto space-y-10">
                <div className="space-y-3 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 mb-6">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xl shadow-sm">
                            ψ
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-foreground/80">149PSI</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                        {isRegister ? "Comece sua jornada" : "Olá, boas-vindas"}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {isRegister
                            ? "Crie sua conta e acesse seu espaço de cuidado."
                            : "Acesse seu espaço de cuidado terapêutico."}
                    </p>
                </div>

                <div className="space-y-6">
                    {isRegister && (
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('patient')}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${selectedRole === 'patient'
                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/30 text-muted-foreground'
                                    }`}
                            >
                                <span className="font-semibold text-lg">Paciente</span>
                                <span className="text-xs mt-1 opacity-80">Busco terapia</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole('therapist')}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 ${selectedRole === 'therapist'
                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/30 text-muted-foreground'
                                    }`}
                            >
                                <span className="font-semibold text-lg">Terapeuta</span>
                                <span className="text-xs mt-1 opacity-80">Sou profissional</span>
                            </button>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl relative bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm font-normal text-base transition-all hover:shadow"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-4 text-muted-foreground/60 tracking-wider font-medium">
                                ou continue com email
                            </span>
                        </div>
                    </div>

                    {!showEmailForm ? (
                        <div className="space-y-3">
                            <Button
                                variant="secondary"
                                className="w-full h-12 rounded-xl font-normal text-base bg-secondary/50 hover:bg-secondary/80 text-secondary-foreground transition-all"
                                onClick={() => { setShowEmailForm(true); setIsRegister(false); }}
                                disabled={loading}
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Entrar com Email
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-12 rounded-xl font-normal text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                onClick={() => { setShowEmailForm(true); setIsRegister(true); }}
                                disabled={loading}
                            >
                                Não tem conta? Cadastre-se
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            {isRegister && (
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Nome Completo"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-background transition-all"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Seu melhor email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                    className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-background transition-all"
                                />
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                        className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-background pr-10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {isRegister && password.length > 0 && (
                                    <div className="space-y-3 py-2 px-1">
                                        <div className="flex gap-1.5 h-1.5">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-full w-full rounded-full transition-all duration-500 ${i < (
                                                        (password.length >= 8 ? 1 : 0) +
                                                        (/[A-Z]/.test(password) ? 1 : 0) +
                                                        (/[a-z]/.test(password) ? 1 : 0) +
                                                        (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0)
                                                    )
                                                        ? (
                                                            (
                                                                (password.length >= 8 ? 1 : 0) +
                                                                (/[A-Z]/.test(password) ? 1 : 0) +
                                                                (/[a-z]/.test(password) ? 1 : 0) +
                                                                (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0)
                                                            ) <= 2 ? 'bg-red-400' :
                                                                (
                                                                    (password.length >= 8 ? 1 : 0) +
                                                                    (/[A-Z]/.test(password) ? 1 : 0) +
                                                                    (/[a-z]/.test(password) ? 1 : 0) +
                                                                    (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0)
                                                                ) === 3 ? 'bg-yellow-400' : 'bg-emerald-400'
                                                        )
                                                        : 'bg-muted'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        {/* Simplified hint list for cleaner design */}
                                        <div className="text-xs text-muted-foreground">
                                            Recomendamos: 8+ caracteres, maiúscula, minúscula e símbolo.
                                        </div>
                                    </div>
                                )}

                                {isRegister && (
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirme sua senha"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                            required
                                            className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-background pr-10 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-xl font-medium text-base shadow-sm hover:shadow-md transition-all" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isRegister ? "Criar Conta" : "Entrar agora"}
                            </Button>

                            <div className="flex flex-col gap-4 text-center text-sm pt-2">
                                {!isRegister && (
                                    <Link to="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
                                        Esqueceu sua senha?
                                    </Link>
                                )}

                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-muted-foreground">
                                        {isRegister ? "Já tem uma conta?" : "Não tem uma conta?"}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto font-medium text-primary hover:underline"
                                        onClick={toggleMode}
                                    >
                                        {isRegister ? "Entrar" : "Criar conta gratuita"}
                                    </Button>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto p-0 font-normal text-muted-foreground/70 hover:text-foreground"
                                    onClick={() => setShowEmailForm(false)}
                                >
                                    Voltar para opções
                                </Button>
                            </div>
                        </form>
                    )}

                    <p className="text-xs text-center text-muted-foreground/60 leading-relaxed px-4 lg:px-0 pt-4">
                        Protegido por reCAPTCHA e sujeito à <Link to="/privacy" className="underline hover:text-foreground">Política de Privacidade</Link> e <Link to="/terms" className="underline hover:text-foreground">Termos de Uso</Link> do 149PSI.
                    </p>
                </div>
            </div>
        </div>
    );
};
