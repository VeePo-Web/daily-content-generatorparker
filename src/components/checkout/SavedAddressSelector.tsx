import { MapPin, ChevronDown, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSavedAddresses, CheckoutAddress } from "@/hooks/useSavedAddresses";
import { Address } from "@/types/account";
import { Badge } from "@/components/ui/badge";

interface SavedAddressSelectorProps {
  type: 'shipping' | 'billing';
  onSelect: (address: CheckoutAddress, rawAddress: Address) => void;
  selectedId?: string;
  className?: string;
}

const SavedAddressSelector = ({
  type,
  onSelect,
  selectedId,
  className = '',
}: SavedAddressSelectorProps) => {
  const { 
    addresses, 
    isLoading, 
    hasSavedAddresses, 
    isAuthenticated,
    toCheckoutFormat,
    getAddressById,
    defaultShippingAddress,
    defaultBillingAddress,
  } = useSavedAddresses();

  // Don't render if not authenticated or no addresses
  if (!isAuthenticated || !hasSavedAddresses) {
    return null;
  }

  const defaultAddress = type === 'shipping' ? defaultShippingAddress : defaultBillingAddress;

  const handleSelect = (addressId: string) => {
    const address = getAddressById(addressId);
    if (address) {
      onSelect(toCheckoutFormat(address), address);
    }
  };

  const formatAddressLabel = (addr: Address) => {
    return `${addr.first_name} ${addr.last_name} - ${addr.address_line_1}, ${addr.city}`;
  };

  const formatAddressPreview = (addr: Address) => {
    return `${addr.address_line_1}${addr.address_line_2 ? `, ${addr.address_line_2}` : ''}, ${addr.city}, ${addr.postal_code}`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="font-light">Use saved address</span>
        {addresses.length > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-none font-normal">
            {addresses.length} saved
          </Badge>
        )}
      </div>
      
      <Select onValueChange={handleSelect} value={selectedId} disabled={isLoading}>
        <SelectTrigger className="rounded-none h-11 bg-muted/30 border-muted-foreground/20 focus:ring-1 focus:ring-foreground">
          <SelectValue placeholder="Select a saved address">
            {selectedId && getAddressById(selectedId) && (
              <span className="truncate text-sm">
                {formatAddressLabel(getAddressById(selectedId)!)}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-none bg-background border-border z-50">
          {addresses.map((addr) => {
            const isDefault = 
              (type === 'shipping' && addr.is_default_shipping) ||
              (type === 'billing' && addr.is_default_billing);
            
            return (
              <SelectItem
                key={addr.id}
                value={addr.id}
                className="rounded-none py-3 cursor-pointer focus:bg-muted"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {addr.first_name} {addr.last_name}
                    </span>
                    {addr.label && (
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 rounded-none font-normal"
                      >
                        {addr.label}
                      </Badge>
                    )}
                    {isDefault && (
                      <Badge 
                        variant="default" 
                        className="text-[10px] px-1.5 py-0 rounded-none font-normal bg-foreground"
                      >
                        Default
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[280px]">
                    {formatAddressPreview(addr)}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SavedAddressSelector;
