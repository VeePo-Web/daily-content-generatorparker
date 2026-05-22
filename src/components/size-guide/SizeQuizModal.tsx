import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ============= Type Definitions =============

export type HeightRange = 'under-5-4' | '5-4-to-5-8' | '5-9-to-6-0' | 'over-6-0';
export type FitPreference = 'fitted' | 'relaxed' | 'oversized';
export type PrimaryCategory = 'tops' | 'bottoms' | 'both';

export interface QuizAnswers {
  heightRange: HeightRange | null;
  fitPreference: FitPreference | null;
  primaryCategory: PrimaryCategory | null;
}

export interface SizeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  answers: QuizAnswers;
  recommendedSizes: { tops: string; bottoms: string; hats: string };
  onSetAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSubmit: () => void;
}

// ============= Quiz Option Component =============

interface QuizOptionProps {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
}

const QuizOption = ({ label, description, isSelected, onClick }: QuizOptionProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full p-4 text-left border transition-all duration-200 rounded-none",
      isSelected
        ? "border-foreground bg-foreground text-background"
        : "border-border hover:border-foreground bg-background text-foreground"
    )}
  >
    <span className="text-sm font-medium">{label}</span>
    {description && (
      <p className={cn(
        "text-xs mt-1",
        isSelected ? "text-background/70" : "text-muted-foreground"
      )}>
        {description}
      </p>
    )}
  </button>
);

// ============= Step Configuration =============

const heightOptions: { value: HeightRange; label: string; description: string }[] = [
  { value: 'under-5-4', label: "Under 5'4\"", description: "162 cm and below" },
  { value: '5-4-to-5-8', label: "5'4\" - 5'8\"", description: "163 - 173 cm" },
  { value: '5-9-to-6-0', label: "5'9\" - 6'0\"", description: "174 - 183 cm" },
  { value: 'over-6-0', label: "Over 6'0\"", description: "184 cm and above" },
];

const fitOptions: { value: FitPreference; label: string; description: string }[] = [
  { value: 'fitted', label: "Fitted", description: "Close to body, tailored look" },
  { value: 'relaxed', label: "Relaxed", description: "Easy movement, slightly loose" },
  { value: 'oversized', label: "Oversized", description: "Extra roomy, streetwear vibe" },
];

const categoryOptions: { value: PrimaryCategory; label: string; description: string }[] = [
  { value: 'tops', label: "Mostly Tops", description: "Tees, hoodies, crewnecks" },
  { value: 'bottoms', label: "Mostly Bottoms", description: "Joggers, shorts, pants" },
  { value: 'both', label: "Both Equally", description: "Full fits, head to toe" },
];

interface StepConfig {
  title: string;
  subtitle: string;
  options: Array<{ value: string; label: string; description: string }>;
  answerKey: 'heightRange' | 'fitPreference' | 'primaryCategory';
}

const steps: StepConfig[] = [
  {
    title: "What's your height?",
    subtitle: "This helps us recommend the right length",
    options: heightOptions,
    answerKey: 'heightRange',
  },
  {
    title: "How do you like your fit?",
    subtitle: "Everyone has their preference",
    options: fitOptions,
    answerKey: 'fitPreference',
  },
  {
    title: "What do you shop for most?",
    subtitle: "We'll prioritize these sizes",
    options: categoryOptions,
    answerKey: 'primaryCategory',
  },
];

// ============= Modal Component =============

const SizeQuizModal = ({
  isOpen,
  onClose,
  currentStep,
  answers,
  recommendedSizes,
  onSetAnswer,
  onNextStep,
  onPrevStep,
  onSubmit,
}: SizeQuizModalProps) => {
  const currentStepData = steps[currentStep];
  const canProceed = answers[currentStepData.answerKey] !== null;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onSubmit();
    } else {
      onNextStep();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onPrevStep();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Progress indicator */}
        <div className="flex gap-1 p-4 pb-0">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1 flex-1 transition-colors duration-300",
                idx <= currentStep ? "bg-foreground" : "bg-muted"
              )}
            />
          ))}
        </div>

        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-light">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground font-light">
            {currentStepData.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {currentStepData.options.map((option) => (
                <QuizOption
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  isSelected={answers[currentStepData.answerKey] === option.value}
                  onClick={() => onSetAnswer(currentStepData.answerKey, option.value as any)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Size preview on last step */}
        {isLastStep && canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-4 p-4 bg-muted/50 border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Your Recommended Sizes
              </span>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-medium">{recommendedSizes.tops}</div>
                <div className="text-xs text-muted-foreground">Tops</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium">{recommendedSizes.bottoms}</div>
                <div className="text-xs text-muted-foreground">Bottoms</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-sm font-light"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {currentStep > 0 ? "Back" : "Skip"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            size="sm"
            className="text-sm font-light"
          >
            {isLastStep ? (
              <>
                Save My Sizes
                <Sparkles className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Gamification message */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            <Lightbulb className="w-3 h-3 inline-block mr-1 align-[-2px]" />
            You'll save 12 seconds on every future purchase
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeQuizModal;
