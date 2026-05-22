/**
 * @deprecated This hook is deprecated. Use useSizeQuizContext from '@/contexts/SizeQuizContext' instead.
 * 
 * This file is kept for backwards compatibility only.
 * The Size Quiz state is now managed entirely by SizeQuizContext.
 */

import { useSizeQuizContext, HeightRange, FitPreference, PrimaryCategory } from '@/contexts/SizeQuizContext';

// Re-export types for backwards compatibility
export type { HeightRange, FitPreference, PrimaryCategory };

/**
 * @deprecated Use useSizeQuizContext instead
 */
export function useSizeQuiz() {
  const context = useSizeQuizContext();
  
  // Map context to the old hook interface for backwards compatibility
  return {
    isOpen: context.isOpen,
    currentStep: context.currentStep,
    answers: context.answers,
    hasCompletedQuiz: context.hasCompletedQuiz,
    openQuiz: context.openQuiz,
    closeQuiz: context.closeQuiz,
    setAnswer: context.setAnswer,
    nextStep: context.nextStep,
    prevStep: context.prevStep,
    submitQuiz: context.submitQuiz,
    isComplete: context.isComplete,
    recommendedSizes: context.recommendedSizes,
  };
}

export default useSizeQuiz;
