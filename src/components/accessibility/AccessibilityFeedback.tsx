import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const assistiveTechOptions = [
  { value: "screen-reader", label: "Screen Reader (NVDA, JAWS, VoiceOver)" },
  { value: "magnification", label: "Screen Magnification" },
  { value: "voice-control", label: "Voice Control / Speech Recognition" },
  { value: "keyboard-only", label: "Keyboard Only" },
  { value: "switch-device", label: "Switch Device" },
  { value: "other", label: "Other / Not Applicable" }
];

const locationOptions = [
  { value: "homepage", label: "Homepage" },
  { value: "product", label: "Product Page" },
  { value: "collection", label: "Collection / Shop Page" },
  { value: "cart", label: "Cart" },
  { value: "checkout", label: "Checkout" },
  { value: "account", label: "Account" },
  { value: "other", label: "Other Page" }
];

const AccessibilityFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    assistiveTech: "",
    location: "",
    description: "",
    isPriority: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.description) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      setFormStatus("Error: Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setFormStatus("Submitting your barrier report...");
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Barrier report received",
      description: formData.isPriority 
        ? "Priority flagged. Our team will respond within 24 hours."
        : "Our team will respond within 48 hours."
    });
    
    setFormStatus("Success: Your barrier report has been submitted. We will respond within 48 hours.");
    setFormData({ 
      name: "", 
      email: "", 
      assistiveTech: "", 
      location: "", 
      description: "",
      isPriority: false 
    });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* ARIA Live Region for form status announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {formStatus}
      </div>

      {/* Name & Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="feedback-name" className="text-sm font-medium">
            Name <span className="text-red-500" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Input
            id="feedback-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your name"
            required
            className="h-11 font-light rounded-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback-email" className="text-sm font-medium">
            Email <span className="text-red-500" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Input
            id="feedback-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            required
            className="h-11 font-light rounded-none"
          />
        </div>
      </div>

      {/* Assistive Technology Select */}
      <div className="space-y-2">
        <Label htmlFor="feedback-assistive-tech" className="text-sm font-medium">
          Assistive Technology Used
        </Label>
        <Select
          value={formData.assistiveTech}
          onValueChange={(value) => setFormData({ ...formData, assistiveTech: value })}
        >
          <SelectTrigger 
            id="feedback-assistive-tech"
            className="h-11 font-light rounded-none"
          >
            <SelectValue placeholder="Select your assistive technology (optional)" />
          </SelectTrigger>
          <SelectContent>
            {assistiveTechOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Radio Group */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Where did you encounter the barrier?
        </Label>
        <RadioGroup
          value={formData.location}
          onValueChange={(value) => setFormData({ ...formData, location: value })}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        >
          {locationOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value} 
                id={`location-${option.value}`}
                className="border-foreground/30"
              />
              <Label 
                htmlFor={`location-${option.value}`}
                className="text-sm font-light cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="feedback-description" className="text-sm font-medium">
          Barrier Description <span className="text-red-500" aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Textarea
          id="feedback-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the barrier you encountered. Include what you were trying to do and what happened instead..."
          required
          rows={5}
          className="font-light resize-none rounded-none"
        />
      </div>

      {/* Priority Checkbox */}
      <div className="flex items-start space-x-3 p-4 bg-champagne-500/5 border border-champagne-500/20">
        <Checkbox
          id="feedback-priority"
          checked={formData.isPriority}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, isPriority: checked as boolean })
          }
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label 
            htmlFor="feedback-priority" 
            className="text-sm font-medium cursor-pointer"
          >
            This barrier is blocking my purchase
          </Label>
          <p className="text-xs text-muted-foreground font-light">
            Flag as priority for faster response (within 24 hours)
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-none font-medium tracking-wide"
      >
        {isSubmitting ? (
          "SUBMITTING..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" strokeWidth={1.5} aria-hidden="true" />
            REPORT BARRIER
          </>
        )}
      </Button>
    </form>
  );
};

export default AccessibilityFeedback;
