import { AvatarFaceConfig } from './avatarPresets';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AvatarFaceEditorProps {
  config: AvatarFaceConfig;
  gender: 'male' | 'female' | 'non-binary';
  onChange: (updates: Partial<AvatarFaceConfig>) => void;
}

const FACE_SHAPES = [
  { id: 'oval', label: 'Oval' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'heart', label: 'Heart' },
  { id: 'oblong', label: 'Oblong' },
] as const;

const FACIAL_HAIR_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'stubble', label: 'Stubble' },
  { id: 'beard', label: 'Beard' },
  { id: 'goatee', label: 'Goatee' },
] as const;

const GLASSES_STYLES = [
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'aviator', label: 'Aviator' },
  { id: 'cat-eye', label: 'Cat-Eye' },
] as const;

export const AvatarFaceEditor = ({ config, gender, onChange }: AvatarFaceEditorProps) => {
  return (
    <div className="space-y-4">
      {/* Face Shape */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Face Shape
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {FACE_SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => onChange({ faceShape: shape.id })}
              className={cn(
                "py-2 px-1 text-[10px] font-medium rounded-lg border transition-all",
                config.faceShape === shape.id 
                  ? "border-foreground bg-foreground text-background" 
                  : "border-border hover:border-foreground/50"
              )}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* Face Proportions */}
        <AccordionItem value="proportions">
          <AccordionTrigger className="text-xs font-medium uppercase tracking-wider text-muted-foreground py-2">
            Face Proportions
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Jaw Width</Label>
                <span className="text-xs text-muted-foreground">{config.jawWidth}</span>
              </div>
              <Slider
                value={[config.jawWidth]}
                onValueChange={([v]) => onChange({ jawWidth: v })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Cheekbones</Label>
                <span className="text-xs text-muted-foreground">{config.cheekboneHeight}</span>
              </div>
              <Slider
                value={[config.cheekboneHeight]}
                onValueChange={([v]) => onChange({ cheekboneHeight: v })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Forehead Height</Label>
                <span className="text-xs text-muted-foreground">{config.foreheadHeight}</span>
              </div>
              <Slider
                value={[config.foreheadHeight]}
                onValueChange={([v]) => onChange({ foreheadHeight: v })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Chin Length</Label>
                <span className="text-xs text-muted-foreground">{config.chinLength}</span>
              </div>
              <Slider
                value={[config.chinLength]}
                onValueChange={([v]) => onChange({ chinLength: v })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Features */}
        <AccordionItem value="features">
          <AccordionTrigger className="text-xs font-medium uppercase tracking-wider text-muted-foreground py-2">
            Features
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Eye Size</Label>
                <span className="text-xs text-muted-foreground">{config.eyeSize}</span>
              </div>
              <Slider
                value={[config.eyeSize]}
                onValueChange={([v]) => onChange({ eyeSize: v })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Nose Width</Label>
                <span className="text-xs text-muted-foreground">{config.noseWidth}</span>
              </div>
              <Slider
                value={[config.noseWidth]}
                onValueChange={([v]) => onChange({ noseWidth: v })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Lip Fullness</Label>
                <span className="text-xs text-muted-foreground">{config.lipFullness}</span>
              </div>
              <Slider
                value={[config.lipFullness]}
                onValueChange={([v]) => onChange({ lipFullness: v })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Accessories */}
        <AccordionItem value="accessories">
          <AccordionTrigger className="text-xs font-medium uppercase tracking-wider text-muted-foreground py-2">
            Accessories
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Facial Hair - only show for male/non-binary */}
            {gender !== 'female' && (
              <div className="space-y-2">
                <Label className="text-xs">Facial Hair</Label>
                <div className="grid grid-cols-4 gap-2">
                  {FACIAL_HAIR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onChange({ facialHair: option.id })}
                      className={cn(
                        "py-1.5 px-2 text-[10px] font-medium rounded-lg border transition-all",
                        config.facialHair === option.id 
                          ? "border-foreground bg-foreground text-background" 
                          : "border-border hover:border-foreground/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Glasses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Glasses</Label>
                <button
                  onClick={() => onChange({ hasGlasses: !config.hasGlasses })}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    config.hasGlasses ? "bg-foreground" : "bg-muted"
                  )}
                >
                  <span 
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full transition-all",
                      config.hasGlasses 
                        ? "right-0.5 bg-background" 
                        : "left-0.5 bg-foreground/40"
                    )}
                  />
                </button>
              </div>
              
              {config.hasGlasses && (
                <div className="grid grid-cols-4 gap-2">
                  {GLASSES_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onChange({ glassesStyle: style.id })}
                      className={cn(
                        "py-1.5 px-2 text-[10px] font-medium rounded-lg border transition-all",
                        config.glassesStyle === style.id 
                          ? "border-foreground bg-foreground text-background" 
                          : "border-border hover:border-foreground/50"
                      )}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
