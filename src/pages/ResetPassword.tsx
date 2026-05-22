import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if user arrived via a valid reset link
  useEffect(() => {
    const checkSession = async () => {
      // Supabase automatically handles the token from the URL
      // and creates a session if valid
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };

    if (!loading) {
      checkSession();
    }
  }, [loading]);

  const passwordStrength = password.length >= 6;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordStrength) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      toast.success('Password updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Password update error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (loading || isValidSession === null) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Invalid or expired link
  if (!isValidSession && !user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 max-w-md mx-auto"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-normal">Invalid or Expired Link</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is no longer valid. Please request a new one.
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Return Home
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-normal tracking-tight">Create new password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">
                {error}
              </div>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-normal text-foreground">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="h-12 bg-background border-border focus:border-foreground transition-colors pr-10"
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
              {/* Password strength indicator */}
              <div className="flex items-center gap-2 text-xs">
                {password.length > 0 && (
                  <>
                    {passwordStrength ? (
                      <CheckCircle2 size={14} className="text-foreground" />
                    ) : (
                      <AlertCircle size={14} className="text-muted-foreground" />
                    )}
                    <span className={passwordStrength ? 'text-foreground' : 'text-muted-foreground'}>
                      {passwordStrength ? 'Password strength: Good' : 'At least 6 characters'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-normal text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 bg-background border-border focus:border-foreground transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 size={14} className="text-foreground" />
                      <span className="text-foreground">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} className="text-destructive" />
                      <span className="text-destructive">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading || !passwordStrength || !passwordsMatch}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-normal tracking-wide disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
