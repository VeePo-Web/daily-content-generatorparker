import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import DrawCheckIcon from "@/components/ui/draw-check-icon";
import { useEmailTypoDetection } from "@/hooks/useEmailTypoDetection";
import EmailTypoSuggestion from "@/components/ui/EmailTypoSuggestion";

const inquiryTypes = [
  { value: "general", label: "General Question" },
  { value: "order-status", label: "Order Status" },
  { value: "returns", label: "Returns & Exchanges" },
  { value: "size-fit", label: "Size & Fit Help" },
  { value: "product", label: "Product Question" },
  { value: "feedback", label: "Feedback / Suggestion" },
  { value: "partnership", label: "Partnership / Press" },
  { value: "other", label: "Other" },
];

const ContactForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  
  // Email typo detection
  const emailTypo = useEmailTypoDetection({
    initialEmail: email,
    onSuggestionAccepted: (correctedEmail) => setEmail(correctedEmail),
  });
  
  const showOrderField = ["order-status", "returns"].includes(inquiryType);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Transmission received.",
      description: "Expect a response within 24 hours.",
    });
    
    // Reset after showing success
    setTimeout(() => {
      setFullName("");
      setEmail("");
      setInquiryType("");
      setOrderNumber("");
      setMessage("");
      setIsPriority(false);
      setIsSubmitted(false);
    }, 3000);
  };
  
  if (isSubmitted) {
    return (
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mb-6">
          <DrawCheckIcon className="w-8 h-8 text-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">Transmission Received</h3>
        <p className="text-muted-foreground max-w-md">
          Your message has been received by the tribe. Expect a response within 24 hours — 
          faster if you flagged this as priority.
        </p>
      </motion.div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name + Email Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Your name"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              emailTypo.setEmail(e.target.value);
            }}
            onBlur={() => emailTypo.checkForTypos(email)}
            required
            placeholder="you@example.com"
            className="h-12"
          />
          <EmailTypoSuggestion
            suggestion={emailTypo.suggestion || ''}
            show={emailTypo.showSuggestion}
            onAccept={emailTypo.acceptSuggestion}
            onDismiss={emailTypo.dismissSuggestion}
            variant="compact"
          />
        </div>
      </div>
      
      {/* Inquiry Type */}
      <div className="space-y-2">
        <Label htmlFor="inquiryType">Inquiry Type *</Label>
        <Select value={inquiryType} onValueChange={setInquiryType} required>
          <SelectTrigger id="inquiryType" className="h-12">
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent>
            {inquiryTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Conditional Order Number */}
      {showOrderField && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input
            id="orderNumber"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g., LOJ-12345"
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            Found in your confirmation email or account orders page.
          </p>
        </motion.div>
      )}
      
      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="How can we help?"
          rows={5}
          className="resize-none"
        />
      </div>
      
      {/* Priority Flag */}
      <div className="flex items-start gap-3 p-4 bg-champagne-500/5 border border-champagne-500/20">
        <Checkbox
          id="priority"
          checked={isPriority}
          onCheckedChange={(checked) => setIsPriority(checked as boolean)}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label htmlFor="priority" className="cursor-pointer font-medium">
            This is preventing my purchase
          </Label>
          <p className="text-xs text-muted-foreground">
            Flag this for expedited response (typically within 4 hours during business hours).
          </p>
        </div>
      </div>
      
      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting || !fullName || !email || !inquiryType || !message}
        className="w-full h-14 text-base font-medium tracking-wide"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            TRANSMITTING...
          </>
        ) : (
          <>
            SEND TRANSMISSION
            <Send className="w-5 h-5 ml-2" strokeWidth={1.5} />
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to our{" "}
        <Link to="/privacy-policy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        . We'll never share your information.
      </p>
    </form>
  );
};

export default ContactForm;
