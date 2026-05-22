import { BodyMeasurementsPanel } from './BodyMeasurementsPanel';
import { OutfitBuilder } from './OutfitBuilder';
import { OutfitSummary } from './OutfitSummary';
import { Separator } from '@/components/ui/separator';
import { AvatarCreationCTA, AvatarCreationFlow } from './avatar-creator';
import { useTryOnState } from '@/hooks/useTryOnState';

export const TryOnSidebar = () => {
  const { 
    customAvatar, 
    showAvatarWizard, 
    setShowAvatarWizard, 
    setCustomAvatar,
    setAvatarMode,
  } = useTryOnState();

  const handleAvatarComplete = (avatar: typeof customAvatar) => {
    setCustomAvatar(avatar);
    setAvatarMode('realistic');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 p-6">
        {/* Create Avatar CTA - show if no custom avatar */}
        {!customAvatar && (
          <>
            <AvatarCreationCTA 
              onStart={() => setShowAvatarWizard(true)}
              onQuickStart={() => setShowAvatarWizard(true)}
            />
            <Separator />
          </>
        )}
        
        {/* Body Measurements & Avatar Configuration */}
        <BodyMeasurementsPanel />
        
        <Separator />
        
        {/* Outfit Slots */}
        <OutfitBuilder />
        
        <Separator />
        
        {/* Summary + Add to Cart */}
        <OutfitSummary />
      </div>
      
      {/* Avatar Creation Wizard */}
      <AvatarCreationFlow
        isOpen={showAvatarWizard}
        onClose={() => setShowAvatarWizard(false)}
        onComplete={handleAvatarComplete}
        initialAvatar={customAvatar}
      />
    </div>
  );
};
