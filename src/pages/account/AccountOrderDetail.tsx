import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types/account';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import OrderReorderButton from '@/components/account/OrderReorderButton';

export default function AccountOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setIsLoading(true);
      const data = await getOrder(orderId);
      setOrder(data);
      setIsLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return 1;
      case 'paid':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const statusSteps = [
    { label: 'Order Placed', icon: Clock },
    { label: 'Confirmed', icon: CheckCircle2 },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: Package },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="mx-auto text-muted-foreground mb-4" size={40} strokeWidth={1} />
        <h2 className="text-lg font-light text-foreground mb-2">Order not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This order may have been removed or you don't have access to it.
        </p>
        <Button asChild variant="outline">
          <Link to="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);
  const shippingAddress = order.shipping_address as Record<string, string>;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-wide text-foreground">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground mt-1">
              Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
            </p>
          </div>
          {order.tracking_url && (
            <Button asChild variant="outline" size="sm">
              <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                <Truck size={16} className="mr-2" />
                Track Package
              </a>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Status timeline */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <motion.div
          className="p-6 border border-border bg-secondary/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-border" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-foreground transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            {statusSteps.map((step, index) => {
              const isCompleted = currentStep > index;
              const isCurrent = currentStep === index + 1;

              return (
                <div
                  key={step.label}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted || isCurrent
                        ? 'bg-foreground text-background'
                        : 'bg-secondary border border-border text-muted-foreground'
                    }`}
                  >
                    <step.icon size={18} strokeWidth={1.5} />
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${
                      isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Cancelled/Refunded status */}
      {(order.status === 'cancelled' || order.status === 'refunded') && (
        <motion.div
          className="p-4 bg-red-50 border border-red-200 text-red-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-sm font-medium">
            This order has been {order.status}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order items */}
        <motion.div
          className="lg:col-span-2 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            Items ({order.order_items?.length || 0})
          </h2>
          <div className="border border-border divide-y divide-border">
            {order.order_items?.map((item) => (
              <div key={item.id} className="p-4 flex gap-4">
                <div className="w-20 h-20 bg-secondary/50 flex-shrink-0 overflow-hidden">
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-muted-foreground" size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product_name}
                  </p>
                  {(item.variant_size || item.variant_color) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[item.variant_size, item.variant_color].filter(Boolean).join(' / ')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  <div className="mt-2">
                    <OrderReorderButton
                      item={item}
                      variant="item"
                      size="sm"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">
                  ${(item.total_cents / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          
          {/* Reorder entire order button */}
          {order.order_items && order.order_items.length > 1 && (
            <div className="mt-4">
              <OrderReorderButton
                items={order.order_items}
                variant="order"
                size="default"
                className="w-full"
              />
            </div>
          )}
        </motion.div>

        {/* Order summary */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Shipping address */}
          <div>
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Shipping Address
            </h2>
            <div className="p-4 border border-border text-sm text-foreground">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-muted-foreground mt-0.5" />
                <div>
                  <p>
                    {shippingAddress?.first_name} {shippingAddress?.last_name}
                  </p>
                  <p className="text-muted-foreground">{shippingAddress?.address_line_1}</p>
                  {shippingAddress?.address_line_2 && (
                    <p className="text-muted-foreground">{shippingAddress.address_line_2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {shippingAddress?.city}, {shippingAddress?.postal_code}
                  </p>
                  <p className="text-muted-foreground">{shippingAddress?.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment summary */}
          <div>
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Payment Summary
            </h2>
            <div className="p-4 border border-border space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(order.subtotal_cents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>
                  {order.shipping_cents === 0
                    ? 'Free'
                    : `$${(order.shipping_cents / 100).toFixed(2)}`}
                </span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${(order.discount_cents / 100).toFixed(2)}</span>
                </div>
              )}
              {order.tax_cents > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>${(order.tax_cents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span>${(order.total_cents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Need help */}
          <div className="p-4 border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Need help with this order?</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/about/customer-care">Contact Support</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
