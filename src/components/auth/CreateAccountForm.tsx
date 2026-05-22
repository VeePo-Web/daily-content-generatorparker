import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import GoogleAuthButton from './GoogleAuthButton';
import AuthDivider from './AuthDivider';
import { useEmailTypoDetection } from '@/hooks/useEmailTypoDetection';
import EmailTypoSuggestion from '@/components/ui/EmailTypoSuggestion';

const createAccountSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

interface CreateAccountFormProps {
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export default function CreateAccountForm({ onSuccess, onSwitchToSignIn }: CreateAccountFormProps) {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  });

  const password = watch('password', '');
  const emailValue = watch('email', '');
  const isPasswordValid = password.length >= 6;
  
  // Email typo detection
  const emailTypo = useEmailTypoDetection({
    initialEmail: emailValue,
    onSuggestionAccepted: (correctedEmail) => setValue('email', correctedEmail),
  });

  const onSubmit = async (data: CreateAccountFormData) => {
    setIsLoading(true);
    try {
      const { data: signUpData, error } = await signUp(data.email, data.password, data.fullName);

      if (error) {
        if (error.message.includes('already registered')) {
          setError('email', { message: 'This email is already registered' });
        } else {
          setError('root', { message: error.message });
        }
        return;
      }

      // Check if email confirmation is required
      const needsConfirmation = signUpData?.user && !signUpData.user.confirmed_at;
      
      if (needsConfirmation) {
        toast.success('Check your email', {
          description: 'We sent a confirmation link to verify your account.',
          duration: 6000,
        });
        onSuccess();
      } else {
        toast.success('Welcome to Line of Judah!', {
          description: 'Your account has been created successfully.',
        });
        onSuccess();
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('root', { message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Google OAuth */}
      <GoogleAuthButton onSuccess={onSuccess} label="Sign up with Google" />
      
      <AuthDivider text="or create with email" />

      {/* Error message */}
      {errors.root && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-none">
          {errors.root.message}
        </div>
      )}

      {/* Full Name (optional) */}
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="text-sm font-normal text-foreground">
          Full Name <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          autoFocus
          placeholder="Your name"
          className="h-12 bg-background border-border focus:border-foreground transition-colors"
          {...register('fullName')}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-normal text-foreground">
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`h-12 bg-background border-border focus:border-foreground transition-colors ${
            errors.email ? 'border-destructive' : ''
          }`}
          {...register('email', {
            onBlur: () => emailTypo.checkForTypos(emailValue),
            onChange: (e) => emailTypo.setEmail(e.target.value),
          })}
        />
        <EmailTypoSuggestion
          suggestion={emailTypo.suggestion || ''}
          show={emailTypo.showSuggestion}
          onAccept={emailTypo.acceptSuggestion}
          onDismiss={emailTypo.dismissSuggestion}
          variant="compact"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-sm font-normal text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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
        
        {/* Password strength indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`flex items-center gap-1 transition-colors ${
              isPasswordValid ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {isPasswordValid && <Check size={12} />}
            6+ characters
          </span>
        </div>
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
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      {/* Benefits */}
      <div className="space-y-2 pt-4 border-t border-border">
        <p className="text-xs font-medium text-foreground">Why create an account?</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <Check size={12} className="mt-0.5 text-foreground" />
            Track your orders in real-time
          </li>
          <li className="flex items-start gap-2">
            <Check size={12} className="mt-0.5 text-foreground" />
            Save addresses for faster checkout
          </li>
          <li className="flex items-start gap-2">
            <Check size={12} className="mt-0.5 text-foreground" />
            Early access to drops and exclusives
          </li>
        </ul>
      </div>

      {/* Switch to signin */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-foreground underline hover:text-muted-foreground transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
