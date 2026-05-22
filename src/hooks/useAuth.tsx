import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  adminLoading: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: { user: User | null; session: Session | null } | null; error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (u: User) => {
    try {
      await supabase.from('profiles').upsert({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || '',
      }, { onConflict: 'id', ignoreDuplicates: true });
    } catch (err) {
      console.error('ensureProfile error:', err);
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Error checking admin role:', err);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setAdminLoading(true);
          setTimeout(() => {
            ensureProfile(session.user);
            checkAdminRole(session.user.id).then((val) => {
              setIsAdmin(val);
              setAdminLoading(false);
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setAdminLoading(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setAdminLoading(true);
        ensureProfile(session.user);
        checkAdminRole(session.user.id).then((val) => {
          setIsAdmin(val);
          setAdminLoading(false);
        });
      } else {
        setAdminLoading(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      const error = result.error ? (result.error instanceof Error ? result.error : new Error(String(result.error))) : null;
      return { error };
    } catch {
      // Fallback to standard OAuth when managed auth is unavailable
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, adminLoading, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

const AUTH_SAFE_DEFAULTS: AuthContextType = {
  user: null,
  session: null,
  isAdmin: false,
  adminLoading: true,
  loading: true,
  signIn: async () => ({ error: new Error('Auth not ready') }),
  signUp: async () => ({ data: null, error: new Error('Auth not ready') }),
  signInWithGoogle: async () => ({ error: new Error('Auth not ready') }),
  signOut: async () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? AUTH_SAFE_DEFAULTS;
}
