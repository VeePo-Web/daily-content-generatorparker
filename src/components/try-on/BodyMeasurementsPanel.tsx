import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeasurementSlider } from './MeasurementSlider';
import { QuickSizePresets } from './QuickSizePresets';
import { SizeRecommendation } from './SizeRecommendation';
import { SaveProfileModal } from './SaveProfileModal';
import { ProfileCard } from './ProfileCard';
import { useTryOnState } from '@/hooks/useTryOnState';
import { useBodyProfiles } from './hooks/useBodyProfiles';
import { 
  BodyMeasurements, 
  measurementRanges,
  quickPresets 
} from './utils/measurementToProportions';
import { recommendSize, SizeRecommendation as SizeRec } from './utils/sizeRecommendation';
import { cn } from '@/lib/utils';
import { Ruler, Weight, User, Sparkles, Save, Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

interface BodyMeasurementsPanelProps {
  className?: string;
}

export const BodyMeasurementsPanel = ({ className }: BodyMeasurementsPanelProps) => {
  const { 
    avatarGender, 
    setAvatarGender,
    avatarSkinTone,
    setAvatarSkinTone,
    measurements,
    setMeasurements,
    unitSystem,
    setUnitSystem,
    setUseDetailedMeasurements,
  } = useTryOnState();

  const {
    profiles,
    activeProfile,
    defaultProfile,
    isLoaded,
    canAddProfile,
    maxProfiles,
    createProfile,
    deleteProfile,
    setDefaultProfile,
    setActiveProfile,
    exportProfile,
    importProfile,
  } = useBodyProfiles();

  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>('quick');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Size recommendation based on current measurements
  const sizeRecommendation: SizeRec | null = useMemo(() => {
    if (!measurements) return null;
    return recommendSize(measurements);
  }, [measurements]);

  // Load default profile on mount
  useEffect(() => {
    if (isLoaded && defaultProfile && !activeProfile) {
      setMeasurements(defaultProfile.measurements);
      setAvatarGender(defaultProfile.gender);
      setActiveProfile(defaultProfile.id);
    }
  }, [isLoaded, defaultProfile, activeProfile, setMeasurements, setAvatarGender, setActiveProfile]);

  // Handle preset selection - enables measurement mode
  const handlePresetSelect = (presetMeasurements: BodyMeasurements) => {
    setMeasurements(presetMeasurements);
    setUseDetailedMeasurements(true); // Enable measurement-based proportions
    const presetId = Object.entries(quickPresets).find(
      ([_, preset]) => preset.measurements === presetMeasurements
    )?.[0];
    setSelectedPresetId(presetId);
    setActiveProfile(null); // Clear active saved profile when using preset
  };

  // Handle individual measurement change - enables measurement mode
  const handleMeasurementChange = (key: keyof BodyMeasurements, value: number) => {
    if (!measurements) return;
    setMeasurements({ ...measurements, [key]: value });
    setUseDetailedMeasurements(true); // Enable measurement-based proportions
    setSelectedPresetId(undefined); // Clear preset when manually adjusting
    setActiveProfile(null); // Clear active profile when manually adjusting
  };

  // Handle save profile
  const handleSaveProfile = (name: string) => {
    if (!measurements) return;
    const profile = createProfile(name, measurements, avatarGender);
    if (profile) {
      toast.success(`Profile "${name}" saved!`);
    } else {
      toast.error(`Maximum ${maxProfiles} profiles allowed`);
    }
  };

  // Handle apply profile - enables measurement mode
  const handleApplyProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setMeasurements(profile.measurements);
      setAvatarGender(profile.gender);
      setUseDetailedMeasurements(true); // Enable measurement-based proportions
      setActiveProfile(profileId);
      setSelectedPresetId(undefined);
      toast.success(`Applied "${profile.name}"`);
    }
  };

  // Handle delete profile
  const handleDeleteProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    deleteProfile(profileId);
    toast.success(`Deleted "${profile?.name}"`);
  };

  // Handle export
  const handleExport = () => {
    if (activeProfile) {
      const json = exportProfile(activeProfile.id);
      if (json) {
        navigator.clipboard.writeText(json);
        toast.success('Profile copied to clipboard');
      }
    } else if (measurements) {
      const json = JSON.stringify({ name: 'Exported', measurements, gender: avatarGender });
      navigator.clipboard.writeText(json);
      toast.success('Measurements copied to clipboard');
    }
  };

  // Handle import
  const handleImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const profile = importProfile(text);
      if (profile) {
        toast.success(`Imported "${profile.name}"`);
      } else {
        toast.error('Invalid profile data');
      }
    } catch {
      toast.error('Failed to read clipboard');
    }
  };

  // Skin tone options
  const skinTones = [
    '#F5DEB3', '#D4A574', '#C68642', '#8D5524', '#5C3317', '#3B2314'
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="quick" className="text-xs">Quick</TabsTrigger>
          <TabsTrigger value="detailed" className="text-xs">Detailed</TabsTrigger>
          <TabsTrigger value="saved" className="text-xs relative">
            Saved
            {profiles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[9px] rounded-full flex items-center justify-center">
                {profiles.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* QUICK TAB */}
        <TabsContent value="quick" className="mt-4 space-y-6">
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

          {/* Quick Presets */}
          <QuickSizePresets 
            onSelectPreset={handlePresetSelect}
            selectedPresetId={selectedPresetId}
          />

          {/* Skin Tone */}
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

          {/* Size Recommendation Preview */}
          {sizeRecommendation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 border-t border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recommended Size
                </h3>
                <div className="flex items-center gap-2 bg-foreground text-background px-3 py-1">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-lg font-bold">{sizeRecommendation.recommendedSize}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {selectedPresetId ? quickPresets[selectedPresetId]?.label : activeProfile?.name || 'your measurements'}
              </p>
            </motion.div>
          )}
        </TabsContent>

        {/* DETAILED TAB */}
        <TabsContent value="detailed" className="mt-4 space-y-6">
          {/* Unit Toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Units
            </span>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs", unitSystem === 'metric' ? 'text-foreground' : 'text-muted-foreground')}>
                cm/kg
              </span>
              <Switch
                checked={unitSystem === 'imperial'}
                onCheckedChange={(checked) => setUnitSystem(checked ? 'imperial' : 'metric')}
              />
              <span className={cn("text-xs", unitSystem === 'imperial' ? 'text-foreground' : 'text-muted-foreground')}>
                in/lbs
              </span>
            </div>
          </div>

          {measurements && (
            <>
              {/* Height & Weight */}
              <div className="space-y-5">
                <MeasurementSlider
                  label="Height"
                  value={measurements.heightCm}
                  min={measurementRanges.height.min}
                  max={measurementRanges.height.max}
                  step={measurementRanges.height.step}
                  unit="height"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('heightCm', val)}
                  icon={<Ruler className="h-3.5 w-3.5" />}
                />

                <MeasurementSlider
                  label="Weight"
                  value={measurements.weightKg}
                  min={measurementRanges.weight.min}
                  max={measurementRanges.weight.max}
                  step={measurementRanges.weight.step}
                  unit="weight"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('weightKg', val)}
                  icon={<Weight className="h-3.5 w-3.5" />}
                />
              </div>

              {/* Body Measurements */}
              <div className="pt-4 border-t border-border space-y-5">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Body Measurements
                </h4>

                <MeasurementSlider
                  label="Chest"
                  value={measurements.chestCm}
                  min={measurementRanges.chest.min}
                  max={measurementRanges.chest.max}
                  step={measurementRanges.chest.step}
                  unit="measurement"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('chestCm', val)}
                />

                <MeasurementSlider
                  label="Waist"
                  value={measurements.waistCm}
                  min={measurementRanges.waist.min}
                  max={measurementRanges.waist.max}
                  step={measurementRanges.waist.step}
                  unit="measurement"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('waistCm', val)}
                />

                <MeasurementSlider
                  label="Hips"
                  value={measurements.hipsCm}
                  min={measurementRanges.hips.min}
                  max={measurementRanges.hips.max}
                  step={measurementRanges.hips.step}
                  unit="measurement"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('hipsCm', val)}
                />

                <MeasurementSlider
                  label="Inseam"
                  value={measurements.inseamCm}
                  min={measurementRanges.inseam.min}
                  max={measurementRanges.inseam.max}
                  step={measurementRanges.inseam.step}
                  unit="measurement"
                  unitSystem={unitSystem}
                  onChange={(val) => handleMeasurementChange('inseamCm', val)}
                />
              </div>

              {/* Size Recommendation */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Size Recommendation
                </h4>
                <SizeRecommendation recommendation={sizeRecommendation} />
              </div>
            </>
          )}
        </TabsContent>

        {/* SAVED TAB */}
        <TabsContent value="saved" className="mt-4 space-y-4">
          {/* Header with count */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              My Saved Profiles
            </h4>
            <span className="text-xs text-muted-foreground">
              {profiles.length}/{maxProfiles}
            </span>
          </div>

          {/* Profile List */}
          <AnimatePresence mode="popLayout">
            {profiles.length > 0 ? (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    isActive={activeProfile?.id === profile.id}
                    onApply={() => handleApplyProfile(profile.id)}
                    onSetDefault={() => setDefaultProfile(profile.id)}
                    onDelete={() => handleDeleteProfile(profile.id)}
                  />
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 space-y-4"
              >
                <Save className="h-10 w-10 text-muted-foreground mx-auto" />
                <div>
                  <h4 className="text-sm font-medium">No Saved Profiles</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Save your measurements for quick access and size recommendations
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Current Button */}
          {canAddProfile && measurements && (
            <Button 
              onClick={() => setShowSaveModal(true)}
              className="w-full gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Save Current as New Profile
            </Button>
          )}

          {/* Export/Import */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2 text-xs"
              onClick={handleExport}
              disabled={!measurements}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2 text-xs"
              onClick={handleImport}
              disabled={!canAddProfile}
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Profile Modal */}
      {measurements && (
        <SaveProfileModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveProfile}
          measurements={measurements}
          gender={avatarGender}
        />
      )}
    </div>
  );
};
