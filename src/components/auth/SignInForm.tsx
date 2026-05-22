import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import GoogleAuthButton from './GoogleAuthButton';
import AuthDivider from './AuthDivider';
import { useEmailTypoDetection } from '@/hooks/useEmailTypoDetection';
import EmailTypoSuggestion from '@/components/ui/EmailTypoSuggestion';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

type ViewState = 'signin' | 'forgot' | 'success';

interface SignInFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInForm({ onSuccess, onSwitchToSignUp }: SignInFormProps) {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot password state
  const [view, setView] = useState<ViewState>('signin');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const emailValue = watch('email');

  // Email typo detection for sign-in email
  const signInEmailTypo = useEmailTypoDetection({
    initialEmail: emailValue || '',
    onSuggestionAccepted: (correctedEmail) => setValue('email', correctedEmail),
  });

  // Email typo detection for reset password email
  const resetEmailTypo = useEmailTypoDetection({
    initialEmail: resetEmail,
    onSuggestionAccepted: (correctedEmail) => setResetEmail(correctedEmail),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('root', { message: 'Invalid email or password' });
        } else {
          setError('root', { message: error.message });
        }
        return;
      }

      toast.success('Welcome back!');
      onSuccess();
    } catch (err) {
      console.error('Sign in error:', err);
      setError('root', { message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Pre-fill with email from sign in form if available
    if (emailValue) {
      setResetEmail(emailValue);
    }
    setResetError(null);
    setView('forgot');
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Please enter a valid email address');
      return;
    }

    setIsResetting(true);
    setResetError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setResetError(error.message);
        return;
      }

      setView('success');
    } catch (err) {
      console.error('Reset password error:', err);
      setResetError('Something went wrong. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToSignIn = () => {
    setView('signin');
    setResetEmail('');
    setResetError(null);
  };

  return (
    <div className="min-h-[300px]">
      <AnimatePresence mode="wait">
        {/* Sign In View */}
        {view === 'signin' && (
          <motion.form
            key="signin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Google OAuth */}
            <GoogleAuthButton onSuccess={onSuccess} />
            
            <AuthDivider text="or continue with email" />

            {/* Error message */}
            {errors.root && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-none">
                {errors.root.message}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="text-sm font-normal text-foreground">
                Email
              </Label>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className={`h-12 bg-background border-border focus:border-foreground transition-colors ${
                  errors.email ? 'border-destructive' : ''
                }`}
                {...register('email', {
                  onChange: (e) => signInEmailTypo.setEmail(e.target.value),
                })}
                onBlur={() => signInEmailTypo.checkForTypos(emailValue)}
              />
              <EmailTypoSuggestion
                suggestion={signInEmailTypo.suggestion || ''}
                show={signInEmailTypo.showSuggestion}
                onAccept={signInEmailTypo.acceptSuggestion}
                onDismiss={signInEmailTypo.dismissSuggestion}
                variant="compact"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password" className="text-sm font-normal text-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`h-12 bg-background border-border focus:border-foreground transition-colors pr-10 ${
                    errors.password ? 'border-destructive' : ''
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-normal tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Switch to signup */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-foreground underline hover:text-muted-foreground transition-colors"
              >
                Create one
              </button>
            </p>
          </motion.form>
        )}

        {/* Forgot Password View */}
        {view === 'forgot' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Back button */}
            <button
              type="button"
              onClick={handleBackToSignIn}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </button>

            {/* Heading */}
            <div className="space-y-2">
              <h3 className="text-lg font-normal">Reset your password</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Error message */}
            {resetError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">
                {resetError}
              </div>
            )}

            {/* Email input */}
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-normal text-foreground">
                Email
              </Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  resetEmailTypo.setEmail(e.target.value);
                }}
                onBlur={() => resetEmailTypo.checkForTypos(resetEmail)}
                placeholder="you@example.com"
                autoFocus
                className="h-12 bg-background border-border focus:border-foreground transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleResetPassword();
                  }
                }}
              />
              <EmailTypoSuggestion
                suggestion={resetEmailTypo.suggestion || ''}
                show={resetEmailTypo.showSuggestion}
                onAccept={resetEmailTypo.acceptSuggestion}
                onDismiss={resetEmailTypo.dismissSuggestion}
                variant="compact"
              />
            </div>

            {/* Submit */}
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={isResetting}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-normal tracking-wide"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </motion.div>
        )}

        {/* Success View */}
        {view === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
              className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center"
            >
              <Mail className="w-8 h-8 text-foreground" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-lg font-normal">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to
                <br />
                <span className="text-foreground font-medium">{resetEmail}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setView('forgot')}
                className="underline hover:text-foreground transition-colors"
              >
                try again
              </button>
            </p>
            <button
              type="button"
              onClick={handleBackToSignIn}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Back to sign in
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
