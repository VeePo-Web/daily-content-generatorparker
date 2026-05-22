import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSizeMemory } from '@/hooks/useSizeMemory';

interface LastOrder {
  id: string;
  created_at: string;
  total_cents: number;
  items: Array<{
    product_name: string;
    variant_size: string | null;
    variant_color: string | null;
    product_image_url: string | null;
  }>;
}

interface ReturnCustomerData {
  // State
  isReturningCustomer: boolean;
  isLoading: boolean;
  firstName: string | null;
  lastOrder: LastOrder | null;
  
  // Derived messages
  greetingMessage: string | null;
  sizeReminderMessage: string | null;
  
  // Actions
  dismissGreeting: () => void;
  hasSeenGreeting: boolean;
}

const GREETING_DISMISSED_KEY = 'loj-greeting-dismissed';
const GREETING_DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Check if greeting was recently dismissed
const isGreetingDismissed = (): boolean => {
  try {
    const dismissed = localStorage.getItem(GREETING_DISMISSED_KEY);
    if (!dismissed) return false;
    
    const dismissedAt = parseInt(dismissed, 10);
    return Date.now() - dismissedAt < GREETING_DISMISS_DURATION;
  } catch {
    return false;
  }
};

// Mark greeting as dismissed
const markGreetingDismissed = (): void => {
  try {
    localStorage.setItem(GREETING_DISMISSED_KEY, Date.now().toString());
  } catch {
    console.warn('Failed to mark greeting as dismissed');
  }
};

/**
 * Hook for recognizing and personalizing the experience for returning customers.
 * Fetches last order, generates personalized greetings, and offers size reminders.
 */
export function useReturnCustomer(): ReturnCustomerData {
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [hasSeenGreeting, setHasSeenGreeting] = useState(isGreetingDismissed);
  
  const { sizeMemory } = useSizeMemory();

  // Fetch return customer data
  const fetchReturnCustomerData = useCallback(async (userId: string) => {
    setIsLoading(true);
    
    try {
      // Fetch profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.full_name) {
        // Extract first name
        const nameParts = profile.full_name.split(' ');
        setFirstName(nameParts[0] || null);
      }

      // Fetch last completed order
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_cents,
          order_items(
            product_name,
            variant_size,
            variant_color,
            product_image_url
          )
        `)
        .eq('user_id', userId)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!ordersError && orders && orders.length > 0) {
        const order = orders[0];
        setLastOrder({
          id: order.id,
          created_at: order.created_at,
          total_cents: order.total_cents,
          items: (order.order_items as Array<{
            product_name: string;
            variant_size: string | null;
            variant_color: string | null;
            product_image_url: string | null;
          }>) || [],
        });
      }
    } catch (e) {
      console.warn('Error fetching return customer data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for auth state
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && isMounted) {
        fetchReturnCustomerData(session.user.id);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user && isMounted) {
          // Reset dismissed state on new sign in
          setHasSeenGreeting(isGreetingDismissed());
          fetchReturnCustomerData(session.user.id);
        } else if (event === 'SIGNED_OUT' && isMounted) {
          setFirstName(null);
          setLastOrder(null);
          setHasSeenGreeting(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchReturnCustomerData]);

  // Dismiss greeting
  const dismissGreeting = useCallback(() => {
    markGreetingDismissed();
    setHasSeenGreeting(true);
  }, []);

  // Derived: is returning customer
  const isReturningCustomer = !!lastOrder;

  // Derived: greeting message
  const greetingMessage = (() => {
    if (!firstName || hasSeenGreeting) return null;
    
    if (isReturningCustomer) {
      return `Welcome back, ${firstName}.`;
    }
    
    return `Hey ${firstName}!`;
  })();

  // Derived: size reminder message
  const sizeReminderMessage = (() => {
    if (!lastOrder || !lastOrder.items.length) return null;
    
    // Find the most common size from last order
    const sizeCounts: Record<string, number> = {};
    lastOrder.items.forEach(item => {
      if (item.variant_size) {
        sizeCounts[item.variant_size] = (sizeCounts[item.variant_size] || 0) + 1;
      }
    });
    
    const mostCommonSize = Object.entries(sizeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    if (!mostCommonSize) return null;
    
    // Check if current memory matches
    const currentTopsSize = sizeMemory.tops;
    if (currentTopsSize === mostCommonSize) return null;
    
    return `Your last order was ${mostCommonSize} in tops — still your size?`;
  })();

  return {
    isReturningCustomer,
    isLoading,
    firstName,
    lastOrder,
    greetingMessage,
    sizeReminderMessage,
    dismissGreeting,
    hasSeenGreeting,
  };
}

export default useReturnCustomer;
