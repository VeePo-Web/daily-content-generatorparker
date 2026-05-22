import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Package, Clock, AlertCircle } from "lucide-react";
import { addDays, format } from "date-fns";

interface ShippingEstimate {
  method: string;
  minDays: number;
  maxDays: number;
  price: string;
  carrier: string;
  includesProduction?: boolean;
}

const ShippingCalculator = () => {
  const [zipCode, setZipCode] = useState("");
  const [estimates, setEstimates] = useState<ShippingEstimate[] | null>(null);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateDelivery = (zip: string): ShippingEstimate[] => {
    // Client-side calculation based on ZIP code region
    const firstDigit = zip[0];
    const isWestCoast = ["9", "8"].includes(firstDigit);
    const isMidwest = ["5", "6", "7"].includes(firstDigit);
    
    // Shipping-only times (before adding production)
    let standardShipping = { min: 3, max: 4 };
    let expressShipping = { min: 2, max: 3 };
    
    if (isWestCoast) {
      standardShipping = { min: 4, max: 5 };
      expressShipping = { min: 2, max: 3 };
    } else if (isMidwest) {
      standardShipping = { min: 3, max: 4 };
      expressShipping = { min: 2, max: 3 };
    }

    // Production time: 2-5 business days (Printful standard)
    const productionMin = 2;
    const productionMax = 5;

    return [
      {
        method: "Standard Shipping",
        minDays: productionMin + standardShipping.min,
        maxDays: productionMax + standardShipping.max,
        price: "Free over $99",
        carrier: "USPS Priority Mail",
        includesProduction: true
      },
      {
        method: "Express Shipping",
        minDays: productionMin + expressShipping.min,
        maxDays: productionMax + expressShipping.max,
        price: "$15",
        carrier: "FedEx 2-Day",
        includesProduction: true
      },
      {
        method: "Overnight",
        minDays: productionMin + 1,
        maxDays: productionMax + 2,
        price: "$35",
        carrier: "FedEx Overnight",
        includesProduction: true
      }
    ];
  };

  const handleCalculate = () => {
    setError("");
    
    // Validate ZIP code
    if (!/^\d{5}$/.test(zipCode)) {
      setError("Please enter a valid 5-digit ZIP code");
      return;
    }

    setIsCalculating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = calculateDelivery(zipCode);
      setEstimates(result);
      setIsCalculating(false);
    }, 500);
  };

  const getDeliveryDate = (days: number) => {
    const deliveryDate = addDays(new Date(), days);
    return format(deliveryDate, "EEE, MMM d");
  };

  const getOrderByMessage = () => {
    const now = new Date();
    const cutoffHour = 14; // 2 PM EST cutoff
    
    if (now.getHours() < cutoffHour) {
      return "Order by 2:00 PM EST for same-day processing";
    }
    return "Orders placed today will ship tomorrow";
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="pl-10 h-12 font-light"
            maxLength={5}
          />
        </div>
        <Button 
          onClick={handleCalculate}
          disabled={isCalculating}
          className="h-12 px-8"
        >
          {isCalculating ? "CALCULATING..." : "CALCULATE ETA"}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Results */}
      {estimates && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Order By Message */}
          <div className="flex items-center gap-2 text-sm text-champagne-600 dark:text-champagne-500">
            <Clock className="w-4 h-4" />
            {getOrderByMessage()}
          </div>

          {/* Delivery Options */}
          <div className="space-y-3">
            {estimates.map((estimate) => (
              <div 
                key={estimate.method}
                className="flex flex-col p-4 bg-stone-50 dark:bg-stone-900"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{estimate.method}</p>
                      <p className="text-sm text-muted-foreground">{estimate.carrier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{estimate.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {estimate.minDays === estimate.maxDays 
                        ? getDeliveryDate(estimate.minDays)
                        : `${getDeliveryDate(estimate.minDays)} - ${getDeliveryDate(estimate.maxDays)}`
                      }
                    </p>
                  </div>
                </div>
                {estimate.includesProduction && (
                  <p className="text-xs text-muted-foreground mt-2 pl-8">
                    Includes 2-5 business days for production
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Delivery to ZIP */}
          <p className="text-xs text-muted-foreground text-center">
            Estimated delivery to {zipCode}. Actual delivery times may vary.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
