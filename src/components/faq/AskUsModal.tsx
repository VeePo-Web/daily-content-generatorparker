import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface AskUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AskUsModal = ({ isOpen, onClose }: AskUsModalProps) => {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Question submitted",
      description: "We'll get back to you within 24 hours.",
    });
    
    // Reset after delay
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail("");
      setOrderNumber("");
      setQuestion("");
      onClose();
    }, 2000);
  };

  const formContent = isSubmitted ? (
    <div className="py-12 text-center">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <DrawCheckIcon size="lg" className="text-green-600 dark:text-green-400" delay={100} />
      </div>
      <h3 className="text-xl font-light mb-2">Question Submitted!</h3>
      <p className="text-muted-foreground font-light">
        We'll be in touch soon.
      </p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-light">Email *</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="next"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderNumber" className="font-light">
          Order Number <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="orderNumber"
          type="text"
          inputMode="text"
          autoComplete="off"
          enterKeyHint="next"
          placeholder="#LOJ-12345"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="question" className="font-light">Your Question *</Label>
        <Textarea
          id="question"
          placeholder="How can we help you?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          rows={4}
          className="resize-none min-h-[120px]"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-12 min-h-[48px] bg-stone-900 hover:bg-stone-800 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Question
            </>
          )}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground font-light">
          or email us directly at{" "}
          <a 
            href="mailto:hello@lineofjudah.com" 
            className="text-champagne-600 hover:underline inline-flex items-center min-h-[44px] px-1"
          >
            hello@lineofjudah.com
          </a>
        </div>
      </div>
    </form>
  );

  // Use Drawer on mobile for better ergonomics
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="px-6 pb-safe max-h-[90vh]">
          <DrawerHeader className="text-left px-0">
            <DrawerTitle className="text-2xl font-light">Ask Us a Question</DrawerTitle>
            <DrawerDescription className="font-light">
              Can't find what you're looking for? We'll get back to you within 24 hours.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto pb-6">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">Ask Us a Question</DialogTitle>
          <DialogDescription className="font-light">
            Can't find what you're looking for? We'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default AskUsModal;
