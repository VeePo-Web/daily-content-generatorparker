import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarMethodSelector } from './AvatarMethodSelector';
import { AvatarLibraryGrid } from './AvatarLibraryGrid';
import { AvatarBodyEditor } from './AvatarBodyEditor';
import { AvatarFaceEditor } from './AvatarFaceEditor';
import { AvatarHairPicker } from './AvatarHairPicker';
import { AvatarPreview } from './AvatarPreview';
import { AIAvatarGenerator } from '../avatar-renderer/AIAvatarGenerator';
import { 
  AvatarConfig, 
  AvatarBodyConfig, 
  AvatarFaceConfig, 
  AvatarHairConfig,
  createDefaultAvatarConfig,
  getAvatarPreset,
} from './avatarPresets';

type WizardStep = 'method' | 'ai' | 'library' | 'body' | 'face' | 'preview';

interface AvatarCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (avatar: AvatarConfig) => void;
  initialAvatar?: AvatarConfig | null;
}

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'method', label: 'Method' },
  { id: 'body', label: 'Body' },
  { id: 'face', label: 'Face & Hair' },
  { id: 'preview', label: 'Preview' },
];

export const AvatarCreationFlow = ({ 
  isOpen, 
  onClose, 
  onComplete,
  initialAvatar,
}: AvatarCreationFlowProps) => {
  const [step, setStep] = useState<WizardStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<'ai' | 'photo' | 'manual' | 'library' | null>(null);
  const [avatar, setAvatar] = useState<AvatarConfig>(
    initialAvatar || createDefaultAvatarConfig('male')
  );

  const handleMethodSelect = useCallback((method: 'ai' | 'photo' | 'manual' | 'library') => {
    setSelectedMethod(method);
    if (method === 'ai') {
      setStep('ai');
    } else if (method === 'library') {
      setStep('library');
    } else if (method === 'manual') {
      setStep('body');
    }
    // Photo method is coming soon
  }, []);

  const handleAIGenerated = useCallback((generatedAvatar: AvatarConfig) => {
    setAvatar(generatedAvatar);
    setStep('body'); // Go to body editor to allow refinement
  }, []);

  const handleLibrarySelect = useCallback((selectedAvatar: AvatarConfig) => {
    setAvatar({
      ...selectedAvatar,
      id: `custom-${Date.now()}`,
      name: 'My Avatar',
      method: 'library',
    });
  }, []);

  const handleBodyChange = useCallback((updates: Partial<AvatarBodyConfig>) => {
    setAvatar(prev => ({
      ...prev,
      body: { ...prev.body, ...updates },
    }));
  }, []);

  const handleGenderChange = useCallback((gender: 'male' | 'female' | 'non-binary') => {
    const defaultConfig = createDefaultAvatarConfig(gender);
    setAvatar(prev => ({
      ...prev,
      gender,
      body: { ...defaultConfig.body, heightCm: prev.body.heightCm, weightKg: prev.body.weightKg },
      face: defaultConfig.face,
    }));
  }, []);

  const handleSkinToneChange = useCallback((skinTone: string) => {
    setAvatar(prev => ({ ...prev, skinTone }));
  }, []);

  const handleFaceChange = useCallback((updates: Partial<AvatarFaceConfig>) => {
    setAvatar(prev => ({
      ...prev,
      face: { ...prev.face, ...updates },
    }));
  }, []);

  const handleHairChange = useCallback((updates: Partial<AvatarHairConfig>) => {
    setAvatar(prev => ({
      ...prev,
      hair: { ...prev.hair, ...updates },
    }));
  }, []);

  const handleNameChange = useCallback((name: string) => {
    setAvatar(prev => ({ ...prev, name }));
  }, []);

  const handleComplete = useCallback(() => {
    onComplete(avatar);
    onClose();
  }, [avatar, onComplete, onClose]);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'ai':
        setStep('method');
        break;
      case 'library':
        setStep('method');
        break;
      case 'body':
        setStep(selectedMethod === 'library' ? 'library' : selectedMethod === 'ai' ? 'ai' : 'method');
        break;
      case 'face':
        setStep('body');
        break;
      case 'preview':
        setStep('face');
        break;
    }
  }, [step, selectedMethod]);

  const handleNext = useCallback(() => {
    switch (step) {
      case 'ai':
        setStep('body');
        break;
      case 'library':
        setStep('body');
        break;
      case 'body':
        setStep('face');
        break;
      case 'face':
        setStep('preview');
        break;
      case 'preview':
        handleComplete();
        break;
    }
  }, [step, handleComplete]);

  const getCurrentStepIndex = () => {
    if (step === 'method') return 0;
    if (step === 'ai') return 0.5;
    if (step === 'library') return 0.5;
    if (step === 'body') return 1;
    if (step === 'face') return 2;
    return 3;
  };

  const canProceed = () => {
    if (step === 'library') return avatar.id !== '';
    if (step === 'ai') return false; // AI step handles its own progression
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-light tracking-tight">
            Create Your Avatar
          </DialogTitle>
          
          {/* Progress indicator */}
          {step !== 'method' && step !== 'ai' && (
            <div className="flex items-center gap-2 mt-4">
              {STEPS.slice(1).map((s, i) => {
                const stepIndex = i + 1;
                const currentIndex = getCurrentStepIndex();
                const isComplete = stepIndex < currentIndex;
                const isCurrent = step === s.id || (step === 'library' && i === 0);
                
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 transition-colors",
                      isComplete ? "bg-foreground text-background" :
                      isCurrent ? "border-2 border-foreground text-foreground" :
                      "border border-border text-muted-foreground"
                    )}>
                      {isComplete ? <Check className="w-3 h-3" /> : stepIndex}
                    </div>
                    {i < STEPS.length - 2 && (
                      <div className={cn(
                        "h-px flex-1 mx-2 transition-colors",
                        stepIndex < currentIndex ? "bg-foreground" : "bg-border"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogHeader>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'method' && (
            <AvatarMethodSelector onSelect={handleMethodSelect} />
          )}
          
          {step === 'ai' && (
            <AIAvatarGenerator
              onGenerate={handleAIGenerated}
              onBack={() => setStep('method')}
            />
          )}
          
          {step === 'library' && (
            <AvatarLibraryGrid
              selectedId={avatar.id}
              onSelect={handleLibrarySelect}
            />
          )}
          
          {step === 'body' && (
            <AvatarBodyEditor
              config={avatar.body}
              gender={avatar.gender}
              skinTone={avatar.skinTone}
              onChange={handleBodyChange}
              onGenderChange={handleGenderChange}
              onSkinToneChange={handleSkinToneChange}
            />
          )}
          
          {step === 'face' && (
            <div className="space-y-6">
              <AvatarFaceEditor
                config={avatar.face}
                gender={avatar.gender}
                onChange={handleFaceChange}
              />
              <div className="border-t border-border pt-6">
                <AvatarHairPicker
                  config={avatar.hair}
                  onChange={handleHairChange}
                />
              </div>
            </div>
          )}
          
          {step === 'preview' && (
            <AvatarPreview
              config={avatar}
              onNameChange={handleNameChange}
            />
          )}
        </div>
        
        {/* Footer */}
        {step !== 'method' && (
          <div className="p-6 pt-4 border-t border-border shrink-0 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              {step === 'preview' ? (
                <>
                  <Check className="w-4 h-4" />
                  Save Avatar
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
