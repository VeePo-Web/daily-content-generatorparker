import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, User, MapPin, ArrowRight, Truck } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function AccountDashboard() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { orders, totalOrders, totalSpent, memberSince, isLoading: ordersLoading } = useOrders();

  const recentOrder = orders[0];
  const isLoading = profileLoading || ordersLoading;

  const stats = [
    {
      label: 'Orders',
      value: totalOrders,
      icon: Package,
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toFixed(2)}`,
      icon: Package,
    },
    {
      label: 'Member Since',
      value: memberSince ? format(memberSince, 'MMM yyyy') : '—',
      icon: User,
    },
  ];

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
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-light tracking-wide text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 border border-border bg-secondary/30">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))
          : stats.map((stat) => (
              <div key={stat.label} className="p-6 border border-border bg-secondary/30">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-light text-foreground">{stat.value}</p>
              </div>
            ))}
      </motion.div>

      {/* Recent Order */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            Recent Order
          </h2>
          {orders.length > 0 && (
            <Link
              to="/account/orders"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 border border-border">
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20" />
              <Skeleton className="h-20 w-20" />
            </div>
          </div>
        ) : recentOrder ? (
          <div className="p-6 border border-border bg-background">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-foreground font-medium">
                  Order #{recentOrder.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(recentOrder.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                  recentOrder.status
                )}`}
              >
                {recentOrder.status.charAt(0).toUpperCase() + recentOrder.status.slice(1)}
              </span>
            </div>

            {/* Order items preview */}
            <div className="flex gap-3 mb-4">
              {recentOrder.order_items?.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="w-16 h-16 bg-secondary/50 flex items-center justify-center overflow-hidden"
                >
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="text-muted-foreground" size={20} />
                  )}
                </div>
              ))}
              {(recentOrder.order_items?.length || 0) > 3 && (
                <div className="w-16 h-16 bg-secondary/50 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{(recentOrder.order_items?.length || 0) - 3}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-foreground">
                ${(recentOrder.total_cents / 100).toFixed(2)}
              </p>
              {recentOrder.tracking_url ? (
                <a
                  href={recentOrder.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground transition-colors"
                >
                  <Truck size={14} />
                  Track Package
                </a>
              ) : (
                <Link
                  to={`/account/orders/${recentOrder.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View Details →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 border border-dashed border-border text-center">
            <Package className="mx-auto text-muted-foreground mb-4" size={32} strokeWidth={1} />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/category/shop">Start Shopping</Link>
            </Button>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/account/orders"
            className="p-4 border border-border hover:border-foreground transition-colors group"
          >
            <Package
              className="text-muted-foreground group-hover:text-foreground transition-colors mb-2"
              size={20}
              strokeWidth={1.5}
            />
            <p className="text-sm text-foreground">View Orders</p>
          </Link>
          <Link
            to="/account/profile"
            className="p-4 border border-border hover:border-foreground transition-colors group"
          >
            <User
              className="text-muted-foreground group-hover:text-foreground transition-colors mb-2"
              size={20}
              strokeWidth={1.5}
            />
            <p className="text-sm text-foreground">Edit Profile</p>
          </Link>
          <Link
            to="/account/addresses"
            className="p-4 border border-border hover:border-foreground transition-colors group"
          >
            <MapPin
              className="text-muted-foreground group-hover:text-foreground transition-colors mb-2"
              size={20}
              strokeWidth={1.5}
            />
            <p className="text-sm text-foreground">Manage Addresses</p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
