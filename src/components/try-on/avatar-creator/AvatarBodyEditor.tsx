import { AvatarBodyConfig, SKIN_TONES } from './avatarPresets';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AvatarBodyEditorProps {
  config: AvatarBodyConfig;
  gender: 'male' | 'female' | 'non-binary';
  skinTone: string;
  onChange: (updates: Partial<AvatarBodyConfig>) => void;
  onGenderChange: (gender: 'male' | 'female' | 'non-binary') => void;
  onSkinToneChange: (tone: string) => void;
}

export const AvatarBodyEditor = ({
  config,
  gender,
  skinTone,
  onChange,
  onGenderChange,
  onSkinToneChange,
}: AvatarBodyEditorProps) => {
  return (
    <div className="space-y-6">
      {/* Gender Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Body Type Base
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {(['male', 'female', 'non-binary'] as const).map((g) => (
            <button
              key={g}
              onClick={() => onGenderChange(g)}
              className={cn(
                "py-2 px-3 text-xs font-medium rounded-lg border transition-all",
                gender === g 
                  ? "border-foreground bg-foreground text-background" 
                  : "border-border hover:border-foreground/50"
              )}
            >
              {g === 'non-binary' ? 'Non-Binary' : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Skin Tone */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Skin Tone
        </Label>
        <div className="flex flex-wrap gap-2">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => onSkinToneChange(tone.hex)}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                skinTone === tone.hex 
                  ? "border-foreground ring-2 ring-foreground ring-offset-2" 
                  : "border-transparent hover:border-foreground/30"
              )}
              style={{ backgroundColor: tone.hex }}
              title={tone.name}
            />
          ))}
        </div>
      </div>

      {/* Measurements */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
          <TabsTrigger value="detailed" className="text-xs">Detailed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Height */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Height</Label>
              <span className="text-xs text-muted-foreground">{config.heightCm} cm</span>
            </div>
            <Slider
              value={[config.heightCm]}
              onValueChange={([v]) => onChange({ heightCm: v })}
              min={150}
              max={200}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Weight */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Weight</Label>
              <span className="text-xs text-muted-foreground">{config.weightKg} kg</span>
            </div>
            <Slider
              value={[config.weightKg]}
              onValueChange={([v]) => onChange({ weightKg: v })}
              min={45}
              max={120}
              step={1}
              className="w-full"
            />
          </div>

          {/* Body Type */}
          <div className="space-y-2">
            <Label className="text-xs">Build</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['ectomorph', 'mesomorph', 'endomorph'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ bodyType: type })}
                  className={cn(
                    "py-2 px-2 text-[10px] font-medium rounded-lg border transition-all capitalize",
                    config.bodyType === type 
                      ? "border-foreground bg-foreground text-background" 
                      : "border-border hover:border-foreground/50"
                  )}
                >
                  {type === 'ectomorph' ? 'Slim' : type === 'mesomorph' ? 'Athletic' : 'Curvy'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Muscle Definition */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Muscle Definition</Label>
              <span className="text-xs text-muted-foreground">{config.muscleDefinition}%</span>
            </div>
            <Slider
              value={[config.muscleDefinition]}
              onValueChange={([v]) => onChange({ muscleDefinition: v })}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="detailed" className="space-y-4 mt-4">
          {/* Chest */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Chest</Label>
              <span className="text-xs text-muted-foreground">{config.chestCm} cm</span>
            </div>
            <Slider
              value={[config.chestCm]}
              onValueChange={([v]) => onChange({ chestCm: v })}
              min={70}
              max={130}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Waist */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Waist</Label>
              <span className="text-xs text-muted-foreground">{config.waistCm} cm</span>
            </div>
            <Slider
              value={[config.waistCm]}
              onValueChange={([v]) => onChange({ waistCm: v })}
              min={55}
              max={120}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Hips */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Hips</Label>
              <span className="text-xs text-muted-foreground">{config.hipsCm} cm</span>
            </div>
            <Slider
              value={[config.hipsCm]}
              onValueChange={([v]) => onChange({ hipsCm: v })}
              min={70}
              max={130}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Shoulder Width */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Shoulder Width</Label>
              <span className="text-xs text-muted-foreground">{config.shoulderWidthCm} cm</span>
            </div>
            <Slider
              value={[config.shoulderWidthCm]}
              onValueChange={([v]) => onChange({ shoulderWidthCm: v })}
              min={35}
              max={55}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Inseam */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Inseam</Label>
              <span className="text-xs text-muted-foreground">{config.inseamCm} cm</span>
            </div>
            <Slider
              value={[config.inseamCm]}
              onValueChange={([v]) => onChange({ inseamCm: v })}
              min={60}
              max={95}
              step={1}
              className="w-full"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
