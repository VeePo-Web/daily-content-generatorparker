import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import OrderReorderButton from '@/components/account/OrderReorderButton';

export default function AccountOrders() {
  const { orders, isLoading } = useOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'paid':
        return 'bg-champagne-100 text-champagne-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-light tracking-wide text-foreground">Order History</h1>
        <p className="text-muted-foreground mt-1">Track and manage your orders</p>
      </motion.div>

      {/* Orders list */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-16 w-16" />
                <Skeleton className="h-16 w-16" />
              </div>
            </div>
          ))
        ) : orders.length > 0 ? (
          orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-6 border border-border bg-background hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-foreground font-medium">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(order.created_at), 'MMMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Order items */}
              <div className="flex gap-3 mb-4 flex-wrap">
                {order.order_items?.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="group relative w-16 h-16 bg-secondary/50 flex items-center justify-center overflow-hidden"
                  >
                    {item.product_image_url ? (
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="text-muted-foreground" size={18} />
                    )}
                  </div>
                ))}
                {(order.order_items?.length || 0) > 4 && (
                  <div className="w-16 h-16 bg-secondary/50 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      +{(order.order_items?.length || 0) - 4}
                    </span>
                  </div>
                )}
              </div>

              {/* Item names */}
              <p className="text-sm text-muted-foreground mb-4">
                {order.order_items
                  ?.slice(0, 2)
                  .map((item) => item.product_name)
                  .join(', ')}
                {(order.order_items?.length || 0) > 2 &&
                  ` and ${(order.order_items?.length || 0) - 2} more`}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground">
                  ${(order.total_cents / 100).toFixed(2)}
                </p>
                <div className="flex items-center gap-3">
                  {order.order_items && order.order_items.length > 0 && (
                    <OrderReorderButton
                      items={order.order_items}
                      variant="order"
                      size="sm"
                    />
                  )}
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-16 border border-dashed border-border text-center">
            <Package className="mx-auto text-muted-foreground mb-4" size={40} strokeWidth={1} />
            <h3 className="text-lg font-light text-foreground mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              When you place an order, it will appear here
            </p>
            <Button asChild variant="outline">
              <Link to="/category/shop">Start Shopping</Link>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
