import { useState } from 'react';
import { Check, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVATAR_PRESETS, AvatarConfig } from './avatarPresets';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AvatarLibraryGridProps {
  selectedId: string | null;
  onSelect: (avatar: AvatarConfig) => void;
}

type GenderFilter = 'all' | 'male' | 'female' | 'non-binary';

export const AvatarLibraryGrid = ({ selectedId, onSelect }: AvatarLibraryGridProps) => {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  
  const filteredAvatars = genderFilter === 'all' 
    ? AVATAR_PRESETS 
    : AVATAR_PRESETS.filter(a => a.gender === genderFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Choose a Model</h3>
          <p className="text-xs text-muted-foreground">
            Select from {filteredAvatars.length} diverse avatars
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <Filter className="w-3.5 h-3.5" />
              <span className="capitalize">{genderFilter === 'all' ? 'All' : genderFilter}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={genderFilter === 'all'}
              onCheckedChange={() => setGenderFilter('all')}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={genderFilter === 'male'}
              onCheckedChange={() => setGenderFilter('male')}
            >
              Male
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={genderFilter === 'female'}
              onCheckedChange={() => setGenderFilter('female')}
            >
              Female
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={genderFilter === 'non-binary'}
              onCheckedChange={() => setGenderFilter('non-binary')}
            >
              Non-Binary
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {filteredAvatars.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          
          return (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar)}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-lg border transition-all duration-200",
                "hover:border-foreground/50 hover:bg-muted/30",
                "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
                isSelected && "border-foreground bg-muted/40"
              )}
            >
              {/* Avatar bust preview - simplified circle with skin tone */}
              <div 
                className="w-14 h-14 rounded-full mb-2 relative overflow-hidden"
                style={{ backgroundColor: avatar.skinTone }}
              >
                {/* Hair simulation */}
                <div 
                  className="absolute inset-x-0 top-0 h-5 rounded-t-full"
                  style={{ 
                    backgroundColor: avatar.hair.color,
                    opacity: avatar.hair.style === 'bald' ? 0 : 1,
                  }}
                />
                
                {/* Face suggestion */}
                <div className="absolute inset-x-3 top-4 bottom-2 rounded-full" 
                  style={{ backgroundColor: avatar.skinTone }} 
                />
              </div>
              
              {/* Info */}
              <span className="text-xs font-medium">{avatar.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {avatar.body.heightCm}cm • {avatar.body.bodyType}
              </span>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="w-3 h-3 text-background" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
