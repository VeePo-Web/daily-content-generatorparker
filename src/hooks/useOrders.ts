import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Order, OrderItem } from '@/types/account';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          return;
        }

        setOrders((data || []) as Order[]);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getOrder = async (orderId: string): Promise<Order | null> => {
    if (!user) return null;

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (orderError || !order) {
        console.error('Error fetching order:', orderError);
        return null;
      }

      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      return {
        ...order,
        order_items: items || [],
      } as Order;
    } catch (err) {
      console.error('Error fetching order:', err);
      return null;
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_cents, 0) / 100;
  const memberSince = user?.created_at ? new Date(user.created_at) : null;

  return { 
    orders, 
    isLoading, 
    getOrder,
    totalOrders,
    totalSpent,
    memberSince,
  };
}
