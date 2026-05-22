import { useTryOnState } from '@/hooks/useTryOnState';
import { cn } from '@/lib/utils';

const bodyTypes = [
  { id: 'slim', label: 'Slim' },
  { id: 'athletic', label: 'Athletic' },
  { id: 'average', label: 'Average' },
  { id: 'curvy', label: 'Curvy' },
] as const;

const skinTones = [
  '#F5DEB3', '#D4A574', '#C68642', '#8D5524', '#5C3317', '#3B2314'
];

export const AvatarSelector = () => {
  const { 
    avatarGender, 
    setAvatarGender, 
    avatarBodyType, 
    setAvatarBodyType,
    avatarSkinTone,
    setAvatarSkinTone
  } = useTryOnState();

  return (
    <div className="space-y-6">
      {/* Gender Selection */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Model
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAvatarGender('male')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-light border transition-all duration-200",
              avatarGender === 'male'
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-transparent text-foreground hover:border-foreground"
            )}
          >
            Male
          </button>
          <button
            onClick={() => setAvatarGender('female')}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-light border transition-all duration-200",
              avatarGender === 'female'
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-transparent text-foreground hover:border-foreground"
            )}
          >
            Female
          </button>
        </div>
      </div>

      {/* Body Type Selection */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Body Type
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {bodyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setAvatarBodyType(type.id)}
              className={cn(
                "py-2.5 px-3 text-sm font-light border transition-all duration-200",
                avatarBodyType === type.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-foreground hover:border-foreground"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Tone Selection */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Skin Tone
        </h3>
        <div className="flex gap-2">
          {skinTones.map((tone) => (
            <button
              key={tone}
              onClick={() => setAvatarSkinTone(tone)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all duration-200",
                avatarSkinTone === tone
                  ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "border-transparent hover:border-muted-foreground"
              )}
              style={{ backgroundColor: tone }}
              aria-label={`Select skin tone ${tone}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
