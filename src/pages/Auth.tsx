import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, Clock, BarChart3, Users } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  validateEmail, 
  validatePassword, 
  checkAuthRateLimit, 
  resetAuthRateLimit, 
  sanitizeInput 
} from '@/utils/security';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [pacote, setPacote] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!email || !password || !fullName || !role || !pacote) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedFullName = sanitizeInput(fullName);
    const sanitizedRole = sanitizeInput(role);
    const sanitizedPacote = sanitizeInput(pacote);
    
    // Validate email
    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: "Erro",
        description: "Por favor, digite um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Senha fraca",
        description: passwordValidation.message,
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    const rateCheck = checkAuthRateLimit(sanitizedEmail);
    if (!rateCheck.allowed) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde 15 minutos antes de tentar novamente.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedFullName,
            role: sanitizedRole,
            pacote: sanitizedPacote
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Reset rate limit on successful signup
        resetAuthRateLimit(sanitizedEmail);
        
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu e-mail para confirmar a conta."
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro desconhecido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha e-mail e senha.",
        variant: "destructive"
      });
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      toast({
        title: "Erro",
        description: "Por favor, digite um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    const rateCheck = checkAuthRateLimit(sanitizedEmail);
    if (!rateCheck.allowed) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde 15 minutos antes de tentar novamente.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Reset rate limit on successful login
        resetAuthRateLimit(sanitizedEmail);
        
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!"
        });
        window.location.href = '/';
      }
    } catch (error: any) {
      const remainingAttempts = rateCheck.remainingAttempts;
      const message = remainingAttempts !== undefined && remainingAttempts > 0
        ? `Credenciais inválidas. ${remainingAttempts} tentativas restantes.`
        : error.message || "Credenciais inválidas. Tente novamente.";
        
      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu e-mail.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Sending password reset email to:', resetEmail);
      
      // Use the current origin to build the redirect URL
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('📧 Reset redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('❌ Reset password error:', error);
        throw error;
      }

      console.log('✅ Password reset email sent successfully');
      toast({
        title: "E-mail enviado!",
        description: "Verifique seu e-mail para redefinir sua senha. O link expira em 1 hora.",
      });
      setShowResetForm(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('❌ Password reset failed:', error);
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message || "Erro desconhecido. Verifique se o e-mail está correto e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [{
    value: "gestor",
    label: "Gestor"
  }, {
    value: "engenheiro",
    label: "Engenheiro"
  }, {
    value: "encarregado",
    label: "Encarregado"
  }, {
    value: "fiscal",
    label: "Fiscal"
  }, {
    value: "cliente",
    label: "Cliente"
  }];

  const pacoteOptions = [
    { value: "Pacote 1", label: "Pacote 1" },
    { value: "Pacote 2", label: "Pacote 2" },
    { value: "Pacote 3", label: "Pacote 3" },
    { value: "Pacote 4", label: "Pacote 4" },
    { value: "Pacote 5", label: "Pacote 5" },
  ];

  // Escolher o ícone baseado no tema
  const logoSrc = theme === 'dark' ? "/lovable-uploads/b7e157d8-4fdf-481b-a8f1-866ca4bc3623.png" : "/lovable-uploads/eaf23cdd-0c79-48bf-a188-139350a878af.png";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Minimal Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/30 relative">
        <div className="flex flex-col justify-center px-16 w-full">
          <div className="mb-16">
            <img src={logoSrc} alt="ObrasFlow Logo" className="w-40 h-auto object-contain mb-6 transition-all duration-300" />
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Organize e acompanhe suas atividades de construção de forma simples e eficiente.
            </p>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-2 text-foreground">Planejamento</h3>
              <p className="text-muted-foreground">
                Gerencie cronogramas e prazos de forma organizada
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-foreground">Acompanhamento</h3>
              <p className="text-muted-foreground">
                Monitore o progresso das atividades em tempo real
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-foreground">Relatórios</h3>
              <p className="text-muted-foreground">
                Visualize dados e métricas importantes do projeto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center mb-4">
              <img src={logoSrc} alt="ObrasFlow Logo" className="w-48 h-auto object-contain transition-all duration-300" />
            </div>
            
            <p className="text-muted-foreground mt-2">Gestão de atividades</p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-muted-foreground">
                Entre com sua conta ou cadastre-se para começar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showResetForm ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-card-foreground mb-2">
                      Redefinir Senha
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Digite seu e-mail para receber um link de redefinição de senha.
                      <br />
                      <span className="text-xs">O link expira em 1 hora.</span>
                    </p>
                  </div>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail" className="text-foreground">E-mail</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="seu@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Link
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowResetForm(false);
                          setResetEmail('');
                        }}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Entrar</TabsTrigger>
                    <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entrar
                      </Button>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-foreground">Nome Completo</Label>
                        <Input id="fullName" type="text" placeholder="Seu nome completo" value={fullName} onChange={e => setFullName(e.target.value)} required className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signupEmail" className="text-foreground">E-mail</Label>
                        <Input id="signupEmail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-foreground">Função</Label>
                        <Select onValueChange={setRole}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Selecione sua função" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map(option => <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pacote" className="text-foreground">Pacote</Label>
                        <Select onValueChange={setPacote}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Selecione seu pacote" />
                          </SelectTrigger>
                          <SelectContent>
                            {pacoteOptions.map(option => <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signupPassword" className="text-foreground">Senha</Label>
                        <Input id="signupPassword" type="password" placeholder="Digite uma senha segura" value={password} onChange={e => setPassword(e.target.value)} required className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cadastrar
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
