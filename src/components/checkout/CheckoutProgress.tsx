import { cn } from "@/lib/utils";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";

interface CheckoutProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Cart" },
  { id: 2, name: "Details" },
  { id: 3, name: "Payment" },
  { id: 4, name: "Complete" }
];

const CheckoutProgress = ({ currentStep }: CheckoutProgressProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                  currentStep > step.id
                    ? "bg-foreground text-background"
                    : currentStep === step.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <DrawCheckIcon size="xs" animate={false} />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 transition-colors",
                  currentStep >= step.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.name}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 sm:w-16 h-0.5 mx-2 transition-colors duration-500",
                  currentStep > step.id ? "bg-foreground" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutProgress;
