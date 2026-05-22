import { createContext, useContext, useState, ReactNode, useCallback, useRef, useMemo } from 'react';
import { useSizeMemory } from '@/hooks/useSizeMemory';
import { useToast } from '@/hooks/use-toast';
import SizeQuizModal, { QuizAnswers, HeightRange, FitPreference, PrimaryCategory } from '@/components/size-guide/SizeQuizModal';

// Re-export types for consumers
export type { QuizAnswers, HeightRange, FitPreference, PrimaryCategory };

// ============= Type Definitions =============

interface PendingAction {
  productId: string;
  categorySlug?: string;
  size?: string;
  color?: string;
  callback: (size: string, color?: string) => void;
}

interface SizeQuizContextType {
  // Modal state
  isOpen: boolean;
  openQuiz: () => void;
  closeQuiz: () => void;
  
  // Quiz progress
  currentStep: number;
  answers: QuizAnswers;
  hasCompletedQuiz: boolean;
  recommendedSizes: { tops: string; bottoms: string; hats: string };
  isComplete: boolean;
  
  // Quiz actions
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitQuiz: () => void;
  
  // Pending action integration
  openQuizWithPending: (action: PendingAction) => void;
  shouldTriggerQuiz: () => boolean;
}

const SizeQuizContext = createContext<SizeQuizContextType | null>(null);

// ============= Constants =============

const QUIZ_COMPLETED_KEY = 'loj-size-quiz-completed';
const SIZE_MEMORY_KEY = 'loj-size-memory';

const DEFAULT_ANSWERS: QuizAnswers = {
  heightRange: null,
  fitPreference: null,
  primaryCategory: null,
};

// ============= Helper Functions =============

const hasCompletedQuizBefore = (): boolean => {
  try {
    return localStorage.getItem(QUIZ_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
};

const markQuizCompleted = (): void => {
  try {
    localStorage.setItem(QUIZ_COMPLETED_KEY, 'true');
  } catch {
    console.warn('Failed to mark quiz as completed');
  }
};

const hasAnySavedSizes = (): boolean => {
  try {
    const stored = localStorage.getItem(SIZE_MEMORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return !!(parsed.tops || parsed.bottoms || parsed.hats);
    }
  } catch {
    // Ignore
  }
  return false;
};

/**
 * Get size recommendation based on height and fit preference
 */
const getSizeRecommendation = (
  heightRange: HeightRange | null,
  fitPreference: FitPreference | null
): { tops: string; bottoms: string; hats: string } => {
  if (!heightRange || !fitPreference) {
    return { tops: 'M', bottoms: 'M', hats: 'ONE SIZE' };
  }

  const baseSizeMap: Record<HeightRange, string> = {
    'under-5-4': 'XS',
    '5-4-to-5-8': 'S',
    '5-9-to-6-0': 'M',
    'over-6-0': 'L',
  };

  const baseSize = baseSizeMap[heightRange];
  const sizeProgression = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const baseIndex = sizeProgression.indexOf(baseSize);
  
  let topsIndex = baseIndex;
  let bottomsIndex = baseIndex;
  
  if (fitPreference === 'oversized') {
    topsIndex = Math.min(baseIndex + 2, sizeProgression.length - 1);
    bottomsIndex = Math.min(baseIndex + 1, sizeProgression.length - 1);
  } else if (fitPreference === 'relaxed') {
    topsIndex = Math.min(baseIndex + 1, sizeProgression.length - 1);
  }
  
  return {
    tops: sizeProgression[topsIndex],
    bottoms: sizeProgression[bottomsIndex],
    hats: 'ONE SIZE',
  };
};

/**
 * Map category slug to size type for pending action resolution
 */
const categoryToSizeType = (categorySlug?: string): 'tops' | 'bottoms' | 'hats' => {
  if (!categorySlug) return 'tops';
  
  const slug = categorySlug.toLowerCase();
  
  const bottomsCategories = ['bottoms', 'shorts', 'joggers', 'sweatpants', 'pants', 'jeans', 'bottom', 'trousers'];
  const hatsCategories = ['hats', 'snapbacks', 'dad-hats', 'beanies', 'caps', 'headwear', 'hat'];
  
  if (bottomsCategories.some(cat => slug.includes(cat))) return 'bottoms';
  if (hatsCategories.some(cat => slug.includes(cat))) return 'hats';
  
  return 'tops';
};

// ============= Provider Component =============

interface SizeQuizProviderProps {
  children: ReactNode;
}

export const SizeQuizProvider = ({ children }: SizeQuizProviderProps) => {
  // Modal visibility
  const [isOpen, setIsOpen] = useState(false);
  
  // Quiz state - ALL consolidated here
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(hasCompletedQuizBefore);
  
  // Pending action for Quick Add integration
  const pendingActionRef = useRef<PendingAction | null>(null);
  
  // Dependencies
  const { rememberSize } = useSizeMemory();
  const { toast } = useToast();

  // Derived: recommended sizes based on current answers
  const recommendedSizes = useMemo(() => {
    return getSizeRecommendation(answers.heightRange, answers.fitPreference);
  }, [answers.heightRange, answers.fitPreference]);

  // Derived: quiz completion status
  const isComplete = useMemo(() => {
    return !!(answers.heightRange && answers.fitPreference && answers.primaryCategory);
  }, [answers]);

  // ============= Quiz Actions =============

  const setAnswer = useCallback(<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const resetQuizState = useCallback(() => {
    setCurrentStep(0);
    setAnswers(DEFAULT_ANSWERS);
  }, []);

  // ============= Submit Quiz =============

  const submitQuiz = useCallback(async () => {
    if (!isComplete) return;

    // 1. Save sizes to memory based on primary category preference
    const sizesToSave: Array<{ category: 'tops' | 'bottoms' | 'hats'; size: string }> = [];
    
    if (answers.primaryCategory === 'tops' || answers.primaryCategory === 'both') {
      sizesToSave.push({ category: 'tops', size: recommendedSizes.tops });
    }
    
    if (answers.primaryCategory === 'bottoms' || answers.primaryCategory === 'both') {
      sizesToSave.push({ category: 'bottoms', size: recommendedSizes.bottoms });
    }
    
    // Always save hats
    sizesToSave.push({ category: 'hats', size: recommendedSizes.hats });

    // Save all sizes (this updates localStorage synchronously)
    for (const { category, size } of sizesToSave) {
      await rememberSize(category, size);
    }

    // 2. Mark quiz as completed BEFORE executing callback
    markQuizCompleted();
    setHasCompletedQuiz(true);

    // 3. Execute pending action if exists
    if (pendingActionRef.current) {
      const pending = pendingActionRef.current;
      pendingActionRef.current = null;
      
      // Resolve correct size based on product category
      const sizeType = categoryToSizeType(pending.categorySlug);
      const resolvedSize = recommendedSizes[sizeType];
      
      // Execute callback with resolved size
      pending.callback(resolvedSize, pending.color);
    }

    // 4. Show success toast
    toast({
      title: "Sizes saved",
      description: "You'll save 12 seconds on every future purchase with one-tap shopping.",
    });

    // 5. Close modal and reset state
    setIsOpen(false);
    resetQuizState();
  }, [isComplete, answers.primaryCategory, recommendedSizes, rememberSize, toast, resetQuizState]);

  // ============= Modal Controls =============

  const openQuiz = useCallback(() => {
    if (!hasCompletedQuiz) {
      resetQuizState();
      setIsOpen(true);
    }
  }, [hasCompletedQuiz, resetQuizState]);

  const openQuizWithPending = useCallback((action: PendingAction) => {
    pendingActionRef.current = action;
    resetQuizState();
    setIsOpen(true);
  }, [resetQuizState]);

  const closeQuiz = useCallback(() => {
    // Clear pending action if quiz wasn't completed
    pendingActionRef.current = null;
    setIsOpen(false);
    resetQuizState();
  }, [resetQuizState]);

  const shouldTriggerQuiz = useCallback((): boolean => {
    // Should trigger if never completed quiz AND no saved sizes
    return !hasCompletedQuiz && !hasAnySavedSizes();
  }, [hasCompletedQuiz]);

  // ============= Context Value =============

  const value: SizeQuizContextType = {
    // Modal state
    isOpen,
    openQuiz,
    closeQuiz,
    
    // Quiz progress
    currentStep,
    answers,
    hasCompletedQuiz,
    recommendedSizes,
    isComplete,
    
    // Quiz actions
    setAnswer,
    nextStep,
    prevStep,
    submitQuiz,
    
    // Pending action integration
    openQuizWithPending,
    shouldTriggerQuiz,
  };

  return (
    <SizeQuizContext.Provider value={value}>
      {children}
      {/* Modal receives props directly - no context hook needed inside */}
      <SizeQuizModal
        isOpen={isOpen}
        onClose={closeQuiz}
        currentStep={currentStep}
        answers={answers}
        recommendedSizes={recommendedSizes}
        onSetAnswer={setAnswer}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onSubmit={submitQuiz}
      />
    </SizeQuizContext.Provider>
  );
};

// ============= Hooks =============

export const useSizeQuizContext = (): SizeQuizContextType => {
  const context = useContext(SizeQuizContext);
  if (!context) {
    throw new Error('useSizeQuizContext must be used within a SizeQuizProvider');
  }
  return context;
};

/**
 * Safe version that returns null if the provider is missing,
 * instead of throwing. Use in hooks that may render outside the provider.
 */
export const useSizeQuizContextSafe = (): SizeQuizContextType | null => {
  return useContext(SizeQuizContext);
};

export default SizeQuizProvider;
