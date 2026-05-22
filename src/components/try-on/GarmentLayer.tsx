import { useMemo } from 'react';
import { 
  HoodieGeometry, 
  CrewneckGeometry, 
  TshirtGeometry, 
  PantsGeometry,
  ShortsGeometry,
  JacketGeometry,
  TankTopGeometry,
  BeanieGeometry,
  SneakerGeometry
} from './garments';
import { useProductColor } from './hooks/useFabricMaterial';
import type { EquippedItem } from '@/hooks/useTryOnState';

interface GarmentLayerProps {
  slot: 'head' | 'top' | 'outerwear' | 'bottom' | 'footwear';
  equipped: EquippedItem | null;
  bodyScale: {
    shoulderWidth: number;
    waistWidth: number;
    hipWidth: number;
    legThickness: number;
  };
}

// Enhanced garment type inference
type GarmentType = 
  | 'hoodie' 
  | 'crewneck' 
  | 'tshirt' 
  | 'tank'
  | 'pants' 
  | 'shorts'
  | 'joggers'
  | 'jacket'
  | 'bomber'
  | 'beanie'
  | 'cap'
  | 'sneaker'
  | 'boot'
  | 'unknown';

const inferGarmentType = (name: string): GarmentType => {
  const nameLower = name.toLowerCase();
  
  // Outerwear
  if (nameLower.includes('hoodie') || nameLower.includes('hoody')) return 'hoodie';
  if (nameLower.includes('bomber')) return 'bomber';
  if (nameLower.includes('jacket') || nameLower.includes('coach') || nameLower.includes('windbreaker')) return 'jacket';
  
  // Tops
  if (nameLower.includes('crewneck') || nameLower.includes('crew neck') || nameLower.includes('sweatshirt')) return 'crewneck';
  if (nameLower.includes('tank') || nameLower.includes('vest') || nameLower.includes('muscle')) return 'tank';
  if (nameLower.includes('tee') || nameLower.includes('t-shirt') || nameLower.includes('shirt')) return 'tshirt';
  
  // Bottoms
  if (nameLower.includes('short') && !nameLower.includes('shirt')) return 'shorts';
  if (nameLower.includes('jogger') || nameLower.includes('sweatpant')) return 'joggers';
  if (nameLower.includes('pant') || nameLower.includes('jean') || nameLower.includes('trouser') || nameLower.includes('chino')) return 'pants';
  
  // Headwear
  if (nameLower.includes('beanie') || nameLower.includes('knit hat') || nameLower.includes('toque')) return 'beanie';
  if (nameLower.includes('cap') || nameLower.includes('hat') || nameLower.includes('snapback')) return 'cap';
  
  // Footwear
  if (nameLower.includes('sneaker') || nameLower.includes('shoe') || nameLower.includes('trainer')) return 'sneaker';
  if (nameLower.includes('boot')) return 'boot';
  
  return 'unknown';
};

// Infer style variants from product name
const inferStyle = (name: string, type: GarmentType) => {
  const nameLower = name.toLowerCase();
  
  if (type === 'shorts') {
    if (nameLower.includes('athletic') || nameLower.includes('sport') || nameLower.includes('basketball')) return 'athletic';
    if (nameLower.includes('swim') || nameLower.includes('board')) return 'swim';
    return 'casual';
  }
  
  if (type === 'jacket') {
    if (nameLower.includes('bomber')) return 'bomber';
    if (nameLower.includes('wind')) return 'windbreaker';
    return 'coach';
  }
  
  if (type === 'beanie') {
    if (nameLower.includes('slouch')) return 'slouchy';
    if (nameLower.includes('fitted') || nameLower.includes('skull')) return 'fitted';
    return 'cuffed';
  }
  
  if (type === 'sneaker') {
    if (nameLower.includes('high') || nameLower.includes('hi-top')) return 'high';
    if (nameLower.includes('runner') || nameLower.includes('running')) return 'runner';
    return 'low';
  }
  
  if (type === 'tshirt') {
    if (nameLower.includes('v-neck') || nameLower.includes('vneck')) return { neck: 'vneck' as const };
    if (nameLower.includes('oversized') || nameLower.includes('boxy')) return { fit: 'oversized' as const };
    if (nameLower.includes('fitted') || nameLower.includes('slim')) return { fit: 'fitted' as const };
  }
  
  if (type === 'tank') {
    if (nameLower.includes('racer')) return 'racerback';
    if (nameLower.includes('crew')) return 'crew';
    return 'scoop';
  }
  
  if (type === 'pants') {
    if (nameLower.includes('slim') || nameLower.includes('skinny')) return 'slim';
    if (nameLower.includes('relaxed') || nameLower.includes('loose') || nameLower.includes('wide')) return 'relaxed';
    return 'straight';
  }
  
  return undefined;
};

export const GarmentLayer = ({ slot, equipped, bodyScale }: GarmentLayerProps) => {
  const color = useProductColor(equipped?.name || '');
  
  const garmentType = useMemo(() => {
    if (!equipped) return null;
    return inferGarmentType(equipped.name);
  }, [equipped]);

  const style = useMemo(() => {
    if (!equipped || !garmentType) return undefined;
    return inferStyle(equipped.name, garmentType);
  }, [equipped, garmentType]);

  if (!equipped) return null;

  // Render appropriate garment based on slot and inferred type
  switch (slot) {
    case 'top':
      // Use textureUrl (flat-front) for 3D, fall back to imageUrl
      const topImageUrl = equipped.textureUrl || equipped.imageUrl;
      
      // Handle hoodie that may have ended up in top slot (fallback)
      if (garmentType === 'hoodie') {
        return (
          <HoodieGeometry 
            color={color}
            imageUrl={topImageUrl}
            garmentType="hoodie"
            bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
          />
        );
      }
      
      if (garmentType === 'tshirt') {
        const tshirtStyle = style as { neck?: 'crew' | 'vneck'; fit?: 'fitted' | 'regular' | 'oversized' } | undefined;
        return (
          <TshirtGeometry 
            color={color}
            imageUrl={topImageUrl}
            garmentType="tshirt"
            bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
            neckStyle={tshirtStyle?.neck || 'crew'}
            fit={tshirtStyle?.fit || 'regular'}
          />
        );
      }
      if (garmentType === 'crewneck') {
        return (
          <CrewneckGeometry 
            color={color}
            imageUrl={topImageUrl}
            garmentType="crewneck"
            bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
          />
        );
      }
      if (garmentType === 'tank') {
        return (
          <TankTopGeometry 
            color={color}
            imageUrl={topImageUrl}
            garmentType="tank"
            bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
            neckStyle={style as 'scoop' | 'crew' | 'racerback' | undefined}
          />
        );
      }
      // Default to crewneck for unrecognized tops
      return (
        <CrewneckGeometry 
          color={color}
          imageUrl={topImageUrl}
          garmentType="crewneck"
          bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
        />
      );

    case 'outerwear':
      // Use textureUrl (flat-front) for 3D, fall back to imageUrl
      const outerwearImageUrl = equipped.textureUrl || equipped.imageUrl;
      
      if (garmentType === 'jacket' || garmentType === 'bomber') {
        return (
          <JacketGeometry 
            color={color}
            imageUrl={outerwearImageUrl}
            garmentType="jacket"
            bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
            style={style as 'coach' | 'bomber' | 'windbreaker' | undefined}
          />
        );
      }
      // Default to hoodie for outerwear
      return (
        <HoodieGeometry 
          color={color}
          imageUrl={outerwearImageUrl}
          garmentType="hoodie"
          bodyScale={{ shoulderWidth: bodyScale.shoulderWidth, waistWidth: bodyScale.waistWidth }}
        />
      );

    case 'bottom':
      // Use textureUrl for bottoms (denim patterns, etc.)
      const bottomImageUrl = equipped.textureUrl || equipped.imageUrl;
      
      if (garmentType === 'shorts') {
        return (
          <ShortsGeometry 
            color={color}
            imageUrl={bottomImageUrl}
            garmentType="shorts"
            bodyScale={{ hipWidth: bodyScale.hipWidth, legThickness: bodyScale.legThickness }}
            style={style as 'athletic' | 'casual' | 'swim' | undefined}
          />
        );
      }
      // Default to pants (includes joggers)
      return (
        <PantsGeometry 
          color={color}
          imageUrl={bottomImageUrl}
          garmentType="pants"
          bodyScale={{ hipWidth: bodyScale.hipWidth, legThickness: bodyScale.legThickness }}
          style={style as 'slim' | 'straight' | 'relaxed' | undefined}
        />
      );

    case 'head':
      const headImageUrl = equipped.textureUrl || equipped.imageUrl;
      
      if (garmentType === 'beanie') {
        return (
          <BeanieGeometry 
            color={color}
            imageUrl={headImageUrl}
            style={style as 'cuffed' | 'slouchy' | 'fitted' | undefined}
          />
        );
      }
      // Default cap
      return (
        <mesh position={[0, 1.78, 0.02]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.10, 0.08, 24]} />
          <meshPhysicalMaterial 
            color={color} 
            roughness={0.7}
            metalness={0}
          />
        </mesh>
      );

    case 'footwear':
      const footwearImageUrl = equipped.textureUrl || equipped.imageUrl;
      
      if (garmentType === 'sneaker' || garmentType === 'boot') {
        return (
          <SneakerGeometry 
            color={color}
            imageUrl={footwearImageUrl}
            style={garmentType === 'boot' ? 'high' : (style as 'low' | 'high' | 'runner' | undefined)}
          />
        );
      }
      // Default sneakers
      return (
        <SneakerGeometry 
          color={color}
          imageUrl={footwearImageUrl}
          style="low"
        />
      );

    default:
      return null;
  }
};
