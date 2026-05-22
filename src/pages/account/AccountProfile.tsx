import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AccountProfile() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: profile?.full_name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    setError: setPasswordError,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    await updateProfile({ full_name: data.fullName });
    setIsUpdatingProfile(false);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        setPasswordError('root', { message: error.message });
        return;
      }

      toast.success('Password updated successfully');
      resetPassword();
      setShowPasswordForm(false);
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('root', { message: 'Failed to update password' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-light tracking-wide text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </motion.div>

      {/* Profile form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Personal Information
        </h2>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-normal">
              Full Name
            </Label>
            <Input
              id="fullName"
              className={`h-12 bg-background ${profileErrors.fullName ? 'border-destructive' : ''}`}
              {...registerProfile('fullName')}
            />
            {profileErrors.fullName && (
              <p className="text-sm text-destructive">{profileErrors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-normal">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="h-12 bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>

          <Button
            type="submit"
            disabled={isUpdatingProfile}
            className="h-10 bg-foreground text-background hover:bg-foreground/90"
          >
            {isUpdatingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </motion.div>

      {/* Password section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="pt-8 border-t border-border"
      >
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Password
        </h2>

        {!showPasswordForm ? (
          <Button
            variant="outline"
            onClick={() => setShowPasswordForm(true)}
            className="h-10"
          >
            Change Password
          </Button>
        ) : (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
            {passwordErrors.root && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">
                {passwordErrors.root.message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-normal">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className={`h-12 bg-background pr-10 ${
                    passwordErrors.newPassword ? 'border-destructive' : ''
                  }`}
                  {...registerPassword('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-normal">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className={`h-12 bg-background ${
                  passwordErrors.confirmPassword ? 'border-destructive' : ''
                }`}
                {...registerPassword('confirmPassword')}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="h-10 bg-foreground text-background hover:bg-foreground/90"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowPasswordForm(false);
                  resetPassword();
                }}
                className="h-10"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
