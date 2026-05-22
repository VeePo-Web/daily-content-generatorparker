import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarConfig } from './avatarPresets';
import { Check, Sparkles, RotateCcw } from 'lucide-react';

interface AvatarPreviewProps {
  config: AvatarConfig;
  onNameChange: (name: string) => void;
}

export const AvatarPreview = ({ config, onNameChange }: AvatarPreviewProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  
  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* 3D Preview Placeholder */}
      <div className="relative aspect-[3/4] bg-gradient-to-b from-muted/30 to-muted/10 rounded-lg overflow-hidden">
        {/* Avatar visualization - simplified bust preview */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-1000 ${isSpinning ? 'rotate-y-360' : ''}`}
          style={{ transform: isSpinning ? 'rotateY(360deg)' : 'rotateY(0deg)' }}
        >
          <div className="relative">
            {/* Body silhouette */}
            <div 
              className="w-32 h-44 rounded-[60%_60%_45%_45%] relative"
              style={{ backgroundColor: config.skinTone }}
            >
              {/* Neck */}
              <div 
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-12"
                style={{ backgroundColor: config.skinTone }}
              />
              
              {/* Head */}
              <div 
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-20 h-24 rounded-[50%_50%_45%_45%]"
                style={{ backgroundColor: config.skinTone }}
              >
                {/* Hair */}
                {config.hair.style !== 'bald' && (
                  <div 
                    className="absolute inset-x-0 top-0 rounded-t-full"
                    style={{ 
                      backgroundColor: config.hair.color,
                      height: config.hair.style === 'afro' ? '80%' : 
                              config.hair.style === 'long' ? '100%' :
                              config.hair.style === 'medium' ? '60%' : '40%',
                      borderRadius: config.hair.style === 'afro' ? '50%' : undefined,
                      transform: config.hair.style === 'afro' ? 'scale(1.3) translateY(-10%)' : undefined,
                    }}
                  />
                )}
                
                {/* Eyes */}
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex gap-4">
                  <div className="w-2.5 h-1.5 bg-foreground/70 rounded-full" />
                  <div className="w-2.5 h-1.5 bg-foreground/70 rounded-full" />
                </div>
                
                {/* Eyebrows */}
                <div className="absolute top-[38%] left-1/2 -translate-x-1/2 flex gap-5">
                  <div 
                    className="w-3 h-0.5 rounded-full"
                    style={{ backgroundColor: config.hair.color }}
                  />
                  <div 
                    className="w-3 h-0.5 rounded-full"
                    style={{ backgroundColor: config.hair.color }}
                  />
                </div>
                
                {/* Nose */}
                <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-2 h-3 rounded-full opacity-30 bg-foreground/20" />
                
                {/* Lips */}
                <div 
                  className="absolute top-[70%] left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: `color-mix(in srgb, ${config.skinTone} 60%, #C48080)`,
                  }}
                />
                
                {/* Facial Hair */}
                {config.face.facialHair !== 'none' && (
                  <div 
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-b-full opacity-60"
                    style={{ 
                      backgroundColor: config.hair.color,
                      height: config.face.facialHair === 'beard' ? '20%' : 
                              config.face.facialHair === 'goatee' ? '12%' : '8%',
                    }}
                  />
                )}
                
                {/* Glasses */}
                {config.face.hasGlasses && (
                  <div className="absolute top-[42%] left-1/2 -translate-x-1/2 flex gap-2">
                    <div className="w-5 h-4 border-2 border-foreground/60 rounded-sm" />
                    <div className="w-5 h-4 border-2 border-foreground/60 rounded-sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Spin button */}
        <button
          onClick={handleSpin}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        {/* Stats overlay */}
        <div className="absolute bottom-4 left-4 text-[10px] text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-border">
          <div>{config.body.heightCm}cm • {config.body.weightKg}kg</div>
          <div className="capitalize">{config.body.bodyType} build</div>
        </div>
      </div>
      
      {/* Name input */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Name Your Avatar
        </Label>
        <Input
          value={config.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="My Avatar"
          className="h-10"
        />
      </div>
      
      {/* Summary */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Avatar Ready!</span>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-green-500" />
            <span>Body configured with your measurements</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-green-500" />
            <span>Face customized to your preferences</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-green-500" />
            <span>Hair style and color selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
