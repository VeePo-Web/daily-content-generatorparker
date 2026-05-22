import { useMemo } from 'react';
import { useAddresses } from './useAddresses';
import { useAuth } from './useAuth';
import { Address } from '@/types/account';

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface UseSavedAddressesReturn {
  /** All user addresses */
  addresses: Address[];
  /** Default shipping address if set */
  defaultShippingAddress: Address | null;
  /** Default billing address if set */
  defaultBillingAddress: Address | null;
  /** Whether addresses are loading */
  isLoading: boolean;
  /** Whether user has any saved addresses */
  hasSavedAddresses: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Convert Address to checkout form format */
  toCheckoutFormat: (address: Address) => CheckoutAddress;
  /** Get address by ID */
  getAddressById: (id: string) => Address | undefined;
}

/**
 * Hook for using saved addresses in checkout for auto-fill functionality.
 * Reduces checkout friction by allowing authenticated users to select
 * from their saved addresses instead of typing.
 */
export function useSavedAddresses(): UseSavedAddressesReturn {
  const { user } = useAuth();
  const { addresses, isLoading } = useAddresses();

  const defaultShippingAddress = useMemo(() => {
    return addresses.find(addr => addr.is_default_shipping) || null;
  }, [addresses]);

  const defaultBillingAddress = useMemo(() => {
    return addresses.find(addr => addr.is_default_billing) || null;
  }, [addresses]);

  const toCheckoutFormat = (address: Address): CheckoutAddress => ({
    firstName: address.first_name,
    lastName: address.last_name,
    phone: address.phone || '',
    address: address.address_line_1 + (address.address_line_2 ? `, ${address.address_line_2}` : ''),
    city: address.city,
    postalCode: address.postal_code,
    country: address.country,
  });

  const getAddressById = (id: string): Address | undefined => {
    return addresses.find(addr => addr.id === id);
  };

  return {
    addresses,
    defaultShippingAddress,
    defaultBillingAddress,
    isLoading,
    hasSavedAddresses: addresses.length > 0,
    isAuthenticated: !!user,
    toCheckoutFormat,
    getAddressById,
  };
}
