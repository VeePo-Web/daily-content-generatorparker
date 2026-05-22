import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_color: string | null;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

const FULFILLMENT_STATUSES = ['unfulfilled', 'fulfilled', 'shipped', 'delivered'];

const AdminOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fulfillmentStatus, setFulfillmentStatus] = useState('unfulfilled');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        const [orderRes, itemsRes] = await Promise.all([
          supabase.from('orders').select('*').eq('id', orderId).single(),
          supabase.from('order_items').select('*').eq('order_id', orderId),
        ]);

        if (orderRes.error) throw orderRes.error;
        setOrder(orderRes.data);
        setItems(itemsRes.data || []);
        setFulfillmentStatus(orderRes.data.fulfillment_status || 'unfulfilled');
        setTrackingNumber(orderRes.data.tracking_number || '');
        setTrackingUrl(orderRes.data.tracking_url || '');
        setNotes(orderRes.data.notes || '');
      } catch {
        toast({ title: 'Error', description: 'Order not found', variant: 'destructive' });
        navigate('/ops-portal/orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId, navigate, toast]);

  const handleSave = async () => {
    if (!orderId) return;
    setSaving(true);
    try {
      const updates: any = {
        fulfillment_status: fulfillmentStatus,
        tracking_number: trackingNumber || null,
        tracking_url: trackingUrl || null,
        notes: notes || null,
      };

      if (fulfillmentStatus === 'shipped' && !order.shipped_at) {
        updates.shipped_at = new Date().toISOString();
      }
      if (fulfillmentStatus === 'delivered' && !order.delivered_at) {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
      setOrder({ ...order, ...updates });
      toast({ title: 'Order updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) return null;

  const shipping = typeof order.shipping_address === 'object' ? order.shipping_address : {};
  const addr = (obj: any, ...keys: string[]) => keys.map(k => obj?.[k]).find(v => v);

  const isDirty = order && (
    fulfillmentStatus !== (order.fulfillment_status || 'unfulfilled') ||
    trackingNumber !== (order.tracking_number || '') ||
    trackingUrl !== (order.tracking_url || '') ||
    notes !== (order.notes || '')
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ops-portal/orders')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-light tracking-wider text-foreground">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(order.created_at), 'MMMM d, yyyy · h:mm a')}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs uppercase tracking-wider relative">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isDirty ? 'Save Changes •' : 'Save Changes'}
            {isDirty && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: items + totals */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Items ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                    {item.product_image_url ? (
                      <img src={item.product_image_url} alt="" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-secondary rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[item.variant_size, item.variant_color].filter(Boolean).join(' / ') || 'Default'}
                        {' · Qty: '}{item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">${(item.total_cents / 100).toFixed(2)}</p>
                  </div>
                ))}

                <div className="pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(order.subtotal_cents / 100).toFixed(2)}</span>
                  </div>
                  {order.discount_cents > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span>
                      <span>-${(order.discount_cents / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${(order.shipping_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(order.tax_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${(order.total_cents / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span className="text-muted-foreground">{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                {order.shipped_at && (
                  <div className="flex justify-between">
                    <span>Shipped</span>
                    <span className="text-muted-foreground">{format(new Date(order.shipped_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex justify-between">
                    <span>Delivered</span>
                    <span className="text-muted-foreground">{format(new Date(order.delivered_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: customer + fulfillment */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">
                  {[order.customer_first_name, order.customer_last_name].filter(Boolean).join(' ') || 'Guest'}
                </p>
                <p className="text-muted-foreground">{order.customer_email}</p>
                {order.customer_phone && <p className="text-muted-foreground">{order.customer_phone}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {addr(shipping, 'line1', 'address_line_1') && <p>{addr(shipping, 'line1', 'address_line_1')}</p>}
                {addr(shipping, 'line2', 'address_line_2') && <p>{addr(shipping, 'line2', 'address_line_2')}</p>}
                <p>{[addr(shipping, 'city'), addr(shipping, 'state', 'province', 'region'), addr(shipping, 'postal_code', 'zip', 'zipcode')].filter(Boolean).join(', ')}</p>
                {addr(shipping, 'country') && <p>{addr(shipping, 'country')}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {order.payment_status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Fulfillment</Label>
                  <Select value={fulfillmentStatus} onValueChange={setFulfillmentStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FULFILLMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Tracking Number</Label>
                  <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="1Z999AA1..." />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Tracking URL</Label>
                  <Input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." rows={4} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
