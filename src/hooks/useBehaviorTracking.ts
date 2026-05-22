import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_ID_KEY = 'loj-session-id';
const BEHAVIOR_CACHE_KEY = 'loj-behavior-cache';
const SYNC_INTERVAL = 30000; // Sync every 30 seconds
const MIN_TIME_THRESHOLD = 5000; // 5 seconds minimum before tracking

interface BehaviorSignal {
  product_id: string;
  view_count: number;
  total_time_ms: number;
  zoom_count: number;
  add_remove_count: number;
  last_viewed_at: string;
}

interface BehaviorCache {
  [productId: string]: BehaviorSignal;
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Load behavior cache from localStorage
const loadBehaviorCache = (): BehaviorCache => {
  try {
    const cached = localStorage.getItem(BEHAVIOR_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

// Save behavior cache to localStorage
const saveBehaviorCache = (cache: BehaviorCache): void => {
  try {
    localStorage.setItem(BEHAVIOR_CACHE_KEY, JSON.stringify(cache));
  } catch {
    console.warn('Failed to save behavior cache');
  }
};

interface UseBehaviorTrackingReturn {
  trackView: () => void;
  trackZoom: () => void;
  trackAddRemove: () => void;
  getViewCount: () => number;
  getTotalTime: () => number;
  isHighIntent: () => boolean;
}

/**
 * Hook for tracking user behavior signals on a product page.
 * Tracks view duration, zoom interactions, and add/remove actions.
 * 
 * High intent is defined as:
 * - 3+ views of the same product
 * - 30+ seconds total time on product
 * - Any zoom interaction
 */
export function useBehaviorTracking(productId: string | undefined): UseBehaviorTrackingReturn {
  const sessionId = useRef(getSessionId());
  const viewStartTime = useRef<number | null>(null);
  const behaviorCache = useRef<BehaviorCache>(loadBehaviorCache());
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTrackedView = useRef(false);

  // Get current signal for this product
  const getCurrentSignal = useCallback((): BehaviorSignal | null => {
    if (!productId) return null;
    return behaviorCache.current[productId] || null;
  }, [productId]);

  // Update signal in cache
  const updateSignal = useCallback((updates: Partial<BehaviorSignal>) => {
    if (!productId) return;

    const existing = behaviorCache.current[productId] || {
      product_id: productId,
      view_count: 0,
      total_time_ms: 0,
      zoom_count: 0,
      add_remove_count: 0,
      last_viewed_at: new Date().toISOString(),
    };

    behaviorCache.current[productId] = {
      ...existing,
      ...updates,
      last_viewed_at: new Date().toISOString(),
    };

    saveBehaviorCache(behaviorCache.current);
  }, [productId]);

  // Sync to database
  const syncToDatabase = useCallback(async () => {
    if (!productId) return;

    const signal = behaviorCache.current[productId];
    if (!signal) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      // Upsert based on session_id (for guests) or user_id (for authenticated)
      const { error } = await supabase
        .from('user_behavior_signals')
        .upsert({
          user_id: userId,
          session_id: sessionId.current,
          product_id: signal.product_id,
          view_count: signal.view_count,
          total_time_ms: signal.total_time_ms,
          zoom_count: signal.zoom_count,
          add_remove_count: signal.add_remove_count,
          last_viewed_at: signal.last_viewed_at,
        }, {
          onConflict: userId ? 'user_id,product_id' : 'session_id,product_id',
        });

      if (error) {
        console.warn('Failed to sync behavior signals:', error);
      }
    } catch (e) {
      console.warn('Error syncing behavior signals:', e);
    }
  }, [productId]);

  // Track view (called once per mount)
  const trackView = useCallback(() => {
    if (!productId || hasTrackedView.current) return;
    hasTrackedView.current = true;

    const signal = getCurrentSignal();
    updateSignal({
      view_count: (signal?.view_count || 0) + 1,
    });
  }, [productId, getCurrentSignal, updateSignal]);

  // Track zoom interaction
  const trackZoom = useCallback(() => {
    if (!productId) return;

    const signal = getCurrentSignal();
    updateSignal({
      zoom_count: (signal?.zoom_count || 0) + 1,
    });
  }, [productId, getCurrentSignal, updateSignal]);

  // Track add/remove action
  const trackAddRemove = useCallback(() => {
    if (!productId) return;

    const signal = getCurrentSignal();
    updateSignal({
      add_remove_count: (signal?.add_remove_count || 0) + 1,
    });
  }, [productId, getCurrentSignal, updateSignal]);

  // Get view count
  const getViewCount = useCallback((): number => {
    const signal = getCurrentSignal();
    return signal?.view_count || 0;
  }, [getCurrentSignal]);

  // Get total time
  const getTotalTime = useCallback((): number => {
    const signal = getCurrentSignal();
    return signal?.total_time_ms || 0;
  }, [getCurrentSignal]);

  // Check if high intent
  const isHighIntent = useCallback((): boolean => {
    const signal = getCurrentSignal();
    if (!signal) return false;

    return (
      signal.view_count >= 3 ||
      signal.total_time_ms >= 30000 ||
      signal.zoom_count >= 1
    );
  }, [getCurrentSignal]);

  // Track time on page
  useEffect(() => {
    if (!productId) return;

    viewStartTime.current = Date.now();
    hasTrackedView.current = false;

    // Track view on mount
    trackView();

    // Set up periodic sync
    syncTimeoutRef.current = setInterval(syncToDatabase, SYNC_INTERVAL);

    return () => {
      // Calculate time spent on page
      if (viewStartTime.current) {
        const timeSpent = Date.now() - viewStartTime.current;
        
        // Only track if meaningful time was spent
        if (timeSpent >= MIN_TIME_THRESHOLD) {
          const signal = behaviorCache.current[productId];
          if (signal) {
            behaviorCache.current[productId] = {
              ...signal,
              total_time_ms: signal.total_time_ms + timeSpent,
              last_viewed_at: new Date().toISOString(),
            };
            saveBehaviorCache(behaviorCache.current);
          }
        }
      }

      // Sync on unmount
      syncToDatabase();

      // Clear interval
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [productId, trackView, syncToDatabase]);

  // Sync on visibility change (user leaves tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        syncToDatabase();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncToDatabase]);

  return {
    trackView,
    trackZoom,
    trackAddRemove,
    getViewCount,
    getTotalTime,
    isHighIntent,
  };
}

export default useBehaviorTracking;
