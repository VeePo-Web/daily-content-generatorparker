import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFormError('');

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setFormError('Invalid email or password.');
        return;
      }

      // Verify admin role before navigating
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setFormError('Authentication failed. Please try again.');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        await signOut();
        setFormError('This account is not authorized for the operations portal.');
        return;
      }

      toast({
        title: 'Welcome back',
        description: 'Session authenticated.',
      });
      navigate('/ops-portal');
    } catch {
      setFormError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-light tracking-[0.2em] text-foreground uppercase">
            Operations Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-2 tracking-wider">
            Authorized personnel only
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="signin-email" className="text-xs uppercase tracking-wider">
              Email
            </Label>
            <Input
              id="signin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-11 bg-secondary border-border"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signin-password" className="text-xs uppercase tracking-wider">
              Password
            </Label>
            <div className="relative">
              <Input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 bg-secondary border-border pr-12"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-xs uppercase tracking-[0.15em]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {formError && (
            <p className="text-sm text-destructive text-center mt-2">{formError}</p>
          )}
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setShowForgot(!showForgot); setForgotEmail(email); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider"
          >
            Forgot password?
          </button>
        </div>

        {showForgot && (
          <div className="mt-4 space-y-3">
            <Input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-10 bg-secondary border-border"
            />
            <Button
              variant="outline"
              className="w-full h-10 text-xs uppercase tracking-wider"
              disabled={forgotLoading}
              onClick={async () => {
                setForgotError('');
                const emailCheck = z.string().email();
                if (!emailCheck.safeParse(forgotEmail).success) {
                  setForgotError('Please enter a valid email address.');
                  return;
                }
                setForgotLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                setForgotLoading(false);
                if (error) {
                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                } else {
                  toast({ title: 'Check your email', description: 'A password reset link has been sent.' });
                  setShowForgot(false);
                }
              }}
            >
              {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Reset Link
            </Button>
            {forgotError && (
              <p className="text-xs text-destructive">{forgotError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
