import { useState, useEffect } from "react";
import { Layers, Target, Users, Sparkles, Maximize2, Scissors, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import ServicePageLayout from "@/components/service/ServicePageLayout";
import ServiceSection from "@/components/service/ServiceSection";
import StepFlow from "@/components/service/StepFlow";
import InfoCard from "@/components/service/InfoCard";
import ActionCTA from "@/components/service/ActionCTA";
import UnitToggle from "@/components/size-guide/UnitToggle";
import SizeChartTable from "@/components/size-guide/SizeChartTable";

// Hero value props
const heroValueProps = [
  { icon: Layers, text: "S - 3XL Range" },
  { icon: Target, text: "True to Size" },
  { icon: Users, text: "Model Reference" },
  { icon: Sparkles, text: "AI Fit Finder" }
];

// Measurement protocol steps
const measurementSteps = [
  {
    icon: Ruler,
    title: "CHEST",
    description: "Measure around fullest part. Tape horizontal. Arms relaxed."
  },
  {
    icon: Ruler,
    title: "LENGTH",
    description: "From shoulder peak to hem. Consider fit preference."
  },
  {
    icon: Ruler,
    title: "WAIST",
    description: "Natural waist, not belt line. Snug but not restrictive."
  },
  {
    icon: Ruler,
    title: "SLEEVE",
    description: "Center back neck to wrist. Arm slightly bent."
  }
];

// Size chart data
const sizeChartData = {
  in: [
    { size: "S", chest: "36-38", length: "27", sleeve: "33" },
    { size: "M", chest: "39-41", length: "28", sleeve: "34", isPopular: true },
    { size: "L", chest: "42-44", length: "29", sleeve: "35" },
    { size: "XL", chest: "45-47", length: "30", sleeve: "36" },
    { size: "2XL", chest: "48-50", length: "31", sleeve: "37" },
    { size: "3XL", chest: "51-53", length: "32", sleeve: "38" }
  ],
  cm: [
    { size: "S", chest: "91-97", length: "69", sleeve: "84" },
    { size: "M", chest: "99-104", length: "71", sleeve: "86", isPopular: true },
    { size: "L", chest: "107-112", length: "74", sleeve: "89" },
    { size: "XL", chest: "114-119", length: "76", sleeve: "91" },
    { size: "2XL", chest: "122-127", length: "79", sleeve: "94" },
    { size: "3XL", chest: "130-135", length: "81", sleeve: "97" }
  ]
};

// Fit profile cards
const fitProfiles = [
  {
    icon: Target,
    title: "STANDARD ISSUE",
    description: "Default cut. Not tight, not loose. Battle-ready for any occasion. Size up if you prefer layering."
  },
  {
    icon: Maximize2,
    title: "COMMAND SILHOUETTE",
    description: "Extra room for the streetwear drape. Relaxed through body. Consider sizing down for less volume."
  },
  {
    icon: Scissors,
    title: "TACTICAL CROP",
    description: "Hits at natural waist. Designed for high-waisted bottoms and layering. Check garment length."
  }
];

const SizeGuide = () => {
  const [unit, setUnit] = useState<"in" | "cm">("in");

  useEffect(() => {
    document.title = "Size Guide - Line of Judah";
  }, []);

  const handleContact = () => {
    window.location.href = "mailto:support@lineofjudah.com?subject=Size%20Fit%20Help";
  };

  return (
    <ServicePageLayout
      title="CALIBRATE YOUR ARMOR."
      subtitle="Every piece is cut for combat. Know your dimensions. Trust the fit."
      eyebrow="TACTICAL CALIBRATION"
      heroAlignment="center"
      heroValueProps={heroValueProps}
    >
      {/* Measurement Protocol */}
      <div className="bg-stone-100 dark:bg-stone-900/50 py-16 -mx-6 px-6 mb-16">
        <ServiceSection
          id="protocol"
          title="TAKE YOUR READINGS"
          subtitle="Four measurements. That's all it takes to find your fit."
          className="max-w-5xl mx-auto"
        >
          <StepFlow steps={measurementSteps} variant="compact" />
        </ServiceSection>
      </div>

      {/* Size Chart */}
      <ServiceSection
        id="specifications"
        title="ARMOR SPECIFICATIONS"
        subtitle="Our standard sizing across all tops and outerwear."
      >
        <div className="flex justify-end mb-6">
          <UnitToggle unit={unit} onUnitChange={setUnit} />
        </div>
        <SizeChartTable data={sizeChartData[unit]} unit={unit} />
      </ServiceSection>

      {/* Fit Profiles */}
      <ServiceSection
        id="fit-profiles"
        title="FIT PROFILES"
        subtitle="Each garment is labeled with its intended fit. Here's what they mean."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fitProfiles.map((profile, index) => (
            <InfoCard
              key={index}
              icon={profile.icon}
              title={profile.title}
              description={profile.description}
            />
          ))}
        </div>
      </ServiceSection>

      {/* AI Fit Finder CTA */}
      <ServiceSection
        id="ai-fit"
        title="PERSONALIZED FIT"
        subtitle="Let our AI calibrate your exact measurements."
      >
        {/* Try-On Room link hidden until feature is ready */}
        <InfoCard
          icon={Sparkles}
          title="AI FIT RECOMMENDATION — COMING SOON"
          description="Our AI fit finder will analyze your measurements and body type to recommend your ideal size. Check back soon."
          variant="default"
        />
      </ServiceSection>

      {/* Contact CTA */}
      <ActionCTA
        title="STILL UNCERTAIN?"
        subtitle="Our team helps soldiers find their fit. No question too specific."
        buttonText="CONTACT COMMAND"
        onSubmit={handleContact}
        footerText="Or"
        footerLinks={[
          { text: "Download Full Size Guide PDF", href: "#", isExternal: false }
        ]}
      />
    </ServicePageLayout>
  );
};

export default SizeGuide;
