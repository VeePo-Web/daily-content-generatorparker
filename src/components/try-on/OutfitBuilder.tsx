import { useState } from 'react';
import { ClothingSlot } from './ClothingSlot';
import { ProductDrawer } from './ProductDrawer';
import { useTryOnState } from '@/hooks/useTryOnState';
import { Crown, Shirt, Footprints } from 'lucide-react';

// Custom pants icon since lucide doesn't have one
const PantsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v4l-3 14h-4l-1-10-1 10H7L4 8V4z" />
  </svg>
);

const clothingSlots = [
  { slot: 'head' as const, label: 'Headwear', icon: <Crown className="w-5 h-5" /> },
  { slot: 'top' as const, label: 'Tops', icon: <Shirt className="w-5 h-5" /> },
  { slot: 'outerwear' as const, label: 'Layers', icon: <Shirt className="w-5 h-5" /> },
  { slot: 'bottom' as const, label: 'Bottoms', icon: <PantsIcon /> },
  { slot: 'footwear' as const, label: 'Footwear', icon: <Footprints className="w-5 h-5" /> },
];

export const OutfitBuilder = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { activeSlot, setActiveSlot } = useTryOnState();

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setActiveSlot(null);
  };

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
        Outfit Slots
      </h3>
      
      <div className="space-y-2">
        {clothingSlots.map(({ slot, label, icon }) => (
          <ClothingSlot
            key={slot}
            slot={slot}
            label={label}
            icon={icon}
            onOpenDrawer={handleOpenDrawer}
          />
        ))}
      </div>

      <ProductDrawer 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer}
        slot={activeSlot as 'head' | 'top' | 'outerwear' | 'bottom' | 'footwear' | null}
      />
    </div>
  );
};
