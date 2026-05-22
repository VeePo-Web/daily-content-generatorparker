import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BodyMeasurements, formatHeight, formatWeight } from './utils/measurementToProportions';
import { Ruler, Weight, User } from 'lucide-react';

interface SaveProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  measurements: BodyMeasurements;
  gender: 'male' | 'female';
  defaultName?: string;
}

export const SaveProfileModal = ({
  isOpen,
  onClose,
  onSave,
  measurements,
  gender,
  defaultName = 'My Measurements',
}: SaveProfileModalProps) => {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-light tracking-tight">
            Save Body Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Profile Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Profile Name
            </Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., My Daily Fit"
              className="h-11"
              autoFocus
            />
          </div>

          {/* Measurements Preview */}
          <div className="p-4 border border-border bg-muted/20 space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Saving These Measurements
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatHeight(measurements.heightCm, 'imperial')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatWeight(measurements.weightKg, 'imperial')}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Chest: {measurements.chestCm}cm</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Waist: {measurements.waistCm}cm</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground capitalize">
              {gender} model
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
