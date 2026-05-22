import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Address } from '@/types/account';
import { toast } from 'sonner';

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses:', error);
        return;
      }

      setAddresses(data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const addAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // If this is the first address or it's set as default, clear other defaults
      if (address.is_default_shipping) {
        await supabase
          .from('addresses')
          .update({ is_default_shipping: false })
          .eq('user_id', user.id);
      }
      if (address.is_default_billing) {
        await supabase
          .from('addresses')
          .update({ is_default_billing: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to add address');
        return { error };
      }

      setAddresses(prev => [data, ...prev]);
      toast.success('Address added successfully');
      return { error: null, data };
    } catch (err) {
      console.error('Error adding address:', err);
      return { error: err as Error };
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Handle default flags
      if (updates.is_default_shipping) {
        await supabase
          .from('addresses')
          .update({ is_default_shipping: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }
      if (updates.is_default_billing) {
        await supabase
          .from('addresses')
          .update({ is_default_billing: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to update address');
        return { error };
      }

      await fetchAddresses();
      toast.success('Address updated successfully');
      return { error: null };
    } catch (err) {
      console.error('Error updating address:', err);
      return { error: err as Error };
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to delete address');
        return { error };
      }

      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast.success('Address deleted successfully');
      return { error: null };
    } catch (err) {
      console.error('Error deleting address:', err);
      return { error: err as Error };
    }
  };

  const setDefaultAddress = async (id: string, type: 'shipping' | 'billing') => {
    const updates = type === 'shipping' 
      ? { is_default_shipping: true }
      : { is_default_billing: true };
    return updateAddress(id, updates);
  };

  return { 
    addresses, 
    isLoading, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress,
    refetch: fetchAddresses 
  };
}
