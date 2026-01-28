
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { cleanupAuthState, parseResetPasswordUrl, logAuthState } from '@/utils/authUtils';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const logoSrc = theme === 'dark' ? "/lovable-uploads/b7e157d8-4fdf-481b-a8f1-866ca4bc3623.png" : "/lovable-uploads/eaf23cdd-0c79-48bf-a188-139350a878af.png";

  useEffect(() => {
    const initializePasswordReset = async () => {
      console.log('🔐 Initializing password reset process...');
      
      // Parse URL parameters
      const urlParams = parseResetPasswordUrl(searchParams);
      setDebugInfo(urlParams);

      // Check for errors in URL
      if (urlParams.error) {
        console.error('❌ Error in reset URL:', urlParams.error, urlParams.errorDescription);
        toast({
          title: "Erro no link",
          description: urlParams.errorDescription || "Link de redefinição inválido.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      // Check if we have the necessary parameters for password reset
      if (urlParams.type === 'recovery' && urlParams.accessToken && urlParams.refreshToken) {
        console.log('✅ Valid recovery tokens found');
        
        try {
          // Clean up any existing auth state
          cleanupAuthState();
          
          // Set the session with the tokens from the URL
          console.log('🔄 Setting session with recovery tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: urlParams.accessToken,
            refresh_token: urlParams.refreshToken,
          });

          if (error) {
            console.error('❌ Error setting session:', error);
            throw error;
          }

          console.log('✅ Session set successfully:', {
            hasUser: !!data.user,
            userEmail: data.user?.email
          });

          // Log current auth state
          await logAuthState(supabase);
          
          setIsValidToken(true);
        } catch (error: any) {
          console.error('❌ Failed to set session:', error);
          toast({
            title: "Erro de autenticação",
            description: "Não foi possível validar o token. Tente solicitar um novo link.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 3000);
        }
      } else {
        console.error('❌ Invalid recovery parameters:', urlParams);
        toast({
          title: "Link inválido",
          description: "O link de redefinição de senha é inválido ou expirou.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    initializePasswordReset();
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔑 Starting password reset process...');
    
    if (!password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Log current session before attempting to update
      await logAuthState(supabase);
      
      console.log('🔄 Attempting to update password...');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('❌ Password update failed:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi redefinida com sucesso. Redirecionando para o login..."
      });

      // Clean up auth state and redirect
      setTimeout(() => {
        cleanupAuthState();
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Erro desconhecido. Tente solicitar um novo link de redefinição.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src={logoSrc} alt="ObrasFlow Logo" className="w-32 h-auto object-contain mx-auto mb-4" />
            <CardTitle className="text-destructive">Link Inválido</CardTitle>
            <CardDescription>
              O link de redefinição de senha é inválido ou expirou. Você será redirecionado para a página de login.
            </CardDescription>
            {/* Debug info - remove in production */}
            {debugInfo && process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">
                <details>
                  <summary>Debug Info (Dev Only)</summary>
                  <pre className="whitespace-pre-wrap mt-2">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <img src={logoSrc} alt="ObrasFlow Logo" className="w-32 h-auto object-contain mx-auto mb-4" />
            <CardTitle className="text-card-foreground">Nova Senha</CardTitle>
            <CardDescription className="text-muted-foreground">
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Redefinir Senha
              </Button>
            </form>
            
            {/* Debug info - remove in production */}
            {debugInfo && process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">
                <details>
                  <summary>Debug Info (Dev Only)</summary>
                  <pre className="whitespace-pre-wrap mt-2">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
