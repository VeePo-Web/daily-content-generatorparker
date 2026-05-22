import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SIZE_MEMORY_KEY = 'loj-size-memory';

interface SizeMemory {
  tops: string | null;
  bottoms: string | null;
  hats: string | null;
  tops_updated_at: string | null;
  bottoms_updated_at: string | null;
  hats_updated_at: string | null;
  lastUpdated: string | null;
}

interface SizeConfidence {
  tops: { size: string; confidence: number } | null;
  bottoms: { size: string; confidence: number } | null;
  hats: { size: string; confidence: number } | null;
}

interface UseSizeMemoryReturn {
  // Existing
  getRememberedSize: (categorySlug: string) => string | null;
  rememberSize: (categorySlug: string, size: string) => void;
  clearSizeMemory: () => void;
  sizeMemory: SizeMemory;
  
  // Database sync
  isSynced: boolean;
  isLoading: boolean;
  
  // Confidence scoring
  sizeConfidence: SizeConfidence;
  getSizeConfidence: (categorySlug: string) => number | null;
  getSizeConfidenceMessage: (categorySlug: string) => string | null;
}

const defaultMemory: SizeMemory = {
  tops: null,
  bottoms: null,
  hats: null,
  tops_updated_at: null,
  bottoms_updated_at: null,
  hats_updated_at: null,
  lastUpdated: null,
};

const defaultConfidence: SizeConfidence = {
  tops: null,
  bottoms: null,
  hats: null,
};

type SizeType = 'tops' | 'bottoms' | 'hats';

// Map granular category slugs to size types
const getSizeType = (categorySlug: string): SizeType | null => {
  const slug = categorySlug.toLowerCase();
  
  const topsCategories = [
    'tops', 'tees', 'short-sleeve', 'long-sleeve', 'cropped',
    'hoodies', 'pullover-hoodies', 'zip-up-hoodies', 'crewnecks',
    'quarter-zips', 'lightweight-hoodies', 'top', 't-shirts',
    'sweatshirts', 'jackets', 'outerwear', 'shirts'
  ];
  
  const bottomsCategories = [
    'bottoms', 'shorts', 'joggers', 'sweatpants', 'pants',
    'jeans', 'bottom', 'trousers'
  ];
  
  const hatsCategories = [
    'hats', 'snapbacks', 'dad-hats', 'beanies', 'caps',
    'headwear', 'hat'
  ];
  
  if (topsCategories.some(cat => slug.includes(cat))) return 'tops';
  if (bottomsCategories.some(cat => slug.includes(cat))) return 'bottoms';
  if (hatsCategories.some(cat => slug.includes(cat))) return 'hats';
  
  return null;
};

// Map position strings from lookbook to size types
const getPositionSizeType = (position: string | null): SizeType | null => {
  if (!position) return null;
  
  const pos = position.toLowerCase();
  
  if (['top', 'tops'].includes(pos)) return 'tops';
  if (['bottom', 'bottoms'].includes(pos)) return 'bottoms';
  if (['hat', 'hats', 'headwear'].includes(pos)) return 'hats';
  
  return null;
};

// Load from localStorage
const loadFromLocalStorage = (): SizeMemory => {
  try {
    const stored = localStorage.getItem(SIZE_MEMORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SizeMemory>;
      return { ...defaultMemory, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load size memory from localStorage:', e);
  }
  return defaultMemory;
};

// Save to localStorage
const saveToLocalStorage = (memory: SizeMemory) => {
  try {
    localStorage.setItem(SIZE_MEMORY_KEY, JSON.stringify(memory));
  } catch (e) {
    console.warn('Failed to save size memory to localStorage:', e);
  }
};

export const useSizeMemory = (): UseSizeMemoryReturn => {
  const [sizeMemory, setSizeMemory] = useState<SizeMemory>(defaultMemory);
  const [sizeConfidence, setSizeConfidence] = useState<SizeConfidence>(defaultConfidence);
  const [isSynced, setIsSynced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Prevent duplicate migration toasts and duplicate sync calls
  const hasMigratedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  // Merge localStorage and database preferences (most recent wins per category)
  const mergePreferences = useCallback((
    local: SizeMemory,
    db: {
      tops_size: string | null;
      bottoms_size: string | null;
      hats_size: string | null;
      tops_updated_at: string | null;
      bottoms_updated_at: string | null;
      hats_updated_at: string | null;
    } | null
  ): SizeMemory => {
    if (!db) return local;

    const merged: SizeMemory = { ...local };
    const now = new Date().toISOString();

    // Compare tops
    const localTopsTime = local.tops_updated_at ? new Date(local.tops_updated_at).getTime() : 0;
    const dbTopsTime = db.tops_updated_at ? new Date(db.tops_updated_at).getTime() : 0;
    if (db.tops_size && dbTopsTime >= localTopsTime) {
      merged.tops = db.tops_size;
      merged.tops_updated_at = db.tops_updated_at;
    } else if (local.tops && localTopsTime > dbTopsTime) {
      // Local is newer, keep local
    }

    // Compare bottoms
    const localBottomsTime = local.bottoms_updated_at ? new Date(local.bottoms_updated_at).getTime() : 0;
    const dbBottomsTime = db.bottoms_updated_at ? new Date(db.bottoms_updated_at).getTime() : 0;
    if (db.bottoms_size && dbBottomsTime >= localBottomsTime) {
      merged.bottoms = db.bottoms_size;
      merged.bottoms_updated_at = db.bottoms_updated_at;
    }

    // Compare hats
    const localHatsTime = local.hats_updated_at ? new Date(local.hats_updated_at).getTime() : 0;
    const dbHatsTime = db.hats_updated_at ? new Date(db.hats_updated_at).getTime() : 0;
    if (db.hats_size && dbHatsTime >= localHatsTime) {
      merged.hats = db.hats_size;
      merged.hats_updated_at = db.hats_updated_at;
    }

    merged.lastUpdated = now;
    return merged;
  }, []);

  // Fetch size confidence from database
  const fetchSizeConfidence = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('size_confidence_stats')
        .select('size_type, size, confidence_percentage')
        .eq('user_id', userId);

      if (error) {
        console.warn('Failed to fetch size confidence:', error);
        return;
      }

      const confidence: SizeConfidence = {
        tops: null,
        bottoms: null,
        hats: null,
      };

      data?.forEach(row => {
        if (row.size_type && row.size && row.confidence_percentage !== null) {
          const sizeType = row.size_type as SizeType;
          if (sizeType in confidence) {
            confidence[sizeType] = {
              size: row.size,
              confidence: Number(row.confidence_percentage),
            };
          }
        }
      });

      setSizeConfidence(confidence);
    } catch (e) {
      console.warn('Error fetching size confidence:', e);
    }
  }, []);

  // Upsert preferences to database
  const upsertToDatabase = useCallback(async (userId: string, memory: SizeMemory) => {
    try {
      const { error } = await supabase
        .from('user_size_preferences')
        .upsert({
          user_id: userId,
          tops_size: memory.tops,
          bottoms_size: memory.bottoms,
          hats_size: memory.hats,
          tops_updated_at: memory.tops_updated_at,
          bottoms_updated_at: memory.bottoms_updated_at,
          hats_updated_at: memory.hats_updated_at,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.warn('Failed to sync size preferences to database:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Error upserting size preferences:', e);
      return false;
    }
  }, []);

  // Fetch database preferences and merge
  const syncWithDatabase = useCallback(async (userId: string, showMigrationToast = false) => {
    // Prevent duplicate sync calls (React strict mode double-mount)
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsLoading(true);
    try {
      // Get current localStorage state
      const localMemory = loadFromLocalStorage();

      // Fetch from database
      const { data: dbPrefs, error } = await supabase
        .from('user_size_preferences')
        .select('tops_size, bottoms_size, hats_size, tops_updated_at, bottoms_updated_at, hats_updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch size preferences:', error);
        setIsLoading(false);
        return;
      }

      // Merge preferences (most recent wins)
      const merged = mergePreferences(localMemory, dbPrefs);

      // Check if we have local data to migrate
      const hasLocalData = localMemory.tops || localMemory.bottoms || localMemory.hats;
      const isNewDbRecord = !dbPrefs;

      // Update state and localStorage with merged
      setSizeMemory(merged);
      saveToLocalStorage(merged);

      // Upsert merged to database
      await upsertToDatabase(userId, merged);

      // Fetch confidence scores
      await fetchSizeConfidence(userId);

      setIsSynced(true);

      // Show migration toast only if we had guest data and this is first sync
      if (showMigrationToast && hasLocalData && !hasMigratedRef.current) {
        hasMigratedRef.current = true;
        toast({
          title: 'Your sizes are synced',
          description: 'Your size preferences are now saved to your account',
        });
      }
    } catch (e) {
      console.warn('Error syncing with database:', e);
    } finally {
      setIsLoading(false);
      isSyncingRef.current = false;
    }
  }, [mergePreferences, upsertToDatabase, fetchSizeConfidence, toast]);

  // Initial load from localStorage
  useEffect(() => {
    const stored = loadFromLocalStorage();
    setSizeMemory(stored);
  }, []);

  // Auth state listener for migration
  useEffect(() => {
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && currentUserIdRef.current !== session.user.id) {
        currentUserIdRef.current = session.user.id;
        syncWithDatabase(session.user.id, false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // User just logged in - trigger migration
          if (currentUserIdRef.current !== session.user.id) {
            currentUserIdRef.current = session.user.id;
            hasMigratedRef.current = false;
            syncWithDatabase(session.user.id, true);
          }
        } else if (event === 'SIGNED_OUT') {
          // User logged out - keep localStorage, clear db state
          currentUserIdRef.current = null;
          hasMigratedRef.current = false;
          setIsSynced(false);
          setSizeConfidence(defaultConfidence);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [syncWithDatabase]);

  const getRememberedSize = useCallback((categorySlugOrPosition: string): string | null => {
    // First try as category slug
    let sizeType = getSizeType(categorySlugOrPosition);
    
    // If not found, try as position
    if (!sizeType) {
      sizeType = getPositionSizeType(categorySlugOrPosition);
    }
    
    if (!sizeType) return null;
    
    return sizeMemory[sizeType];
  }, [sizeMemory]);

  const rememberSize = useCallback(async (categorySlugOrPosition: string, size: string) => {
    // First try as category slug
    let sizeType = getSizeType(categorySlugOrPosition);
    
    // If not found, try as position
    if (!sizeType) {
      sizeType = getPositionSizeType(categorySlugOrPosition);
    }
    
    if (!sizeType) return;

    const now = new Date().toISOString();
    const updatedAtKey = `${sizeType}_updated_at` as keyof SizeMemory;

    // Optimistic update
    const newMemory: SizeMemory = {
      ...sizeMemory,
      [sizeType]: size,
      [updatedAtKey]: now,
      lastUpdated: now,
    };
    
    setSizeMemory(newMemory);
    saveToLocalStorage(newMemory);

    // Sync to database if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await upsertToDatabase(session.user.id, newMemory);
    }
  }, [sizeMemory, upsertToDatabase]);

  const clearSizeMemory = useCallback(async () => {
    setSizeMemory(defaultMemory);
    setSizeConfidence(defaultConfidence);
    
    try {
      localStorage.removeItem(SIZE_MEMORY_KEY);
    } catch (e) {
      console.warn('Failed to clear size memory from localStorage:', e);
    }

    // Clear from database if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('user_size_preferences')
        .delete()
        .eq('user_id', session.user.id);
    }
  }, []);

  const getSizeConfidence = useCallback((categorySlug: string): number | null => {
    const sizeType = getSizeType(categorySlug) || getPositionSizeType(categorySlug);
    if (!sizeType) return null;
    return sizeConfidence[sizeType]?.confidence ?? null;
  }, [sizeConfidence]);

  const getSizeConfidenceMessage = useCallback((categorySlug: string): string | null => {
    const sizeType = getSizeType(categorySlug) || getPositionSizeType(categorySlug);
    if (!sizeType) return null;

    const conf = sizeConfidence[sizeType];
    if (!conf || conf.confidence < 50) return null;

    return `Your size ${conf.size} fits ${Math.round(conf.confidence)}% of our ${sizeType}`;
  }, [sizeConfidence]);

  return {
    getRememberedSize,
    rememberSize,
    clearSizeMemory,
    sizeMemory,
    isSynced,
    isLoading,
    sizeConfidence,
    getSizeConfidence,
    getSizeConfidenceMessage,
  };
};

export default useSizeMemory;
