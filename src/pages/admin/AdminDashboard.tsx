import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package, Tags, TrendingUp, Eye, ShoppingBag, AlertTriangle,
  DollarSign, RefreshCw, Users, Megaphone, CheckCircle2, ArrowRight,
  Clock, Images,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  featuredProducts: number;
}

interface RevenueStats {
  today: number;
  week: number;
  month: number;
  total: number;
}

interface RecentOrder {
  id: string;
  customer_email: string;
  total_cents: number;
  payment_status: string;
  fulfillment_status: string | null;
  created_at: string;
}

interface LowStockVariant {
  id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  product: { name: string; id: string } | null;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, activeProducts: 0, totalCategories: 0, featuredProducts: 0 });
  const [revenue, setRevenue] = useState<RevenueStats>({ today: 0, week: 0, month: 0, total: 0 });
  const [unfulfilledCount, setUnfulfilledCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [pendingAmbassadors, setPendingAmbassadors] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [checklistDismissed, setChecklistDismissed] = useState(
    () => localStorage.getItem('admin_checklist_dismissed') === 'true'
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const monthStart = startOfMonth(now).toISOString();

      const [
        productsRes, activeRes, categoriesRes, featuredRes,
        ordersRes, lowStockRes,
        revTotalRes, revTodayRes, revWeekRes, revMonthRes,
        unfulfilledRes, subscribersRes, ambassadorsRes,
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('orders').select('id, customer_email, total_cents, payment_status, fulfillment_status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('product_variants').select('id, size, color, stock_quantity, product:products(name, id)').lt('stock_quantity', 5).order('stock_quantity', { ascending: true }).limit(10),
        // Revenue queries
        supabase.from('orders').select('total_cents').eq('payment_status', 'paid'),
        supabase.from('orders').select('total_cents').eq('payment_status', 'paid').gte('created_at', todayStart),
        supabase.from('orders').select('total_cents').eq('payment_status', 'paid').gte('created_at', weekStart),
        supabase.from('orders').select('total_cents').eq('payment_status', 'paid').gte('created_at', monthStart),
        // Unfulfilled
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'paid').eq('fulfillment_status', 'unfulfilled'),
        // Marketing
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
        supabase.from('ambassador_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalProducts: productsRes.count || 0,
        activeProducts: activeRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        featuredProducts: featuredRes.count || 0,
      });

      const sumCents = (rows: { total_cents: number }[] | null) =>
        (rows || []).reduce((sum, r) => sum + r.total_cents, 0);

      setRevenue({
        total: sumCents(revTotalRes.data),
        today: sumCents(revTodayRes.data),
        week: sumCents(revWeekRes.data),
        month: sumCents(revMonthRes.data),
      });

      setUnfulfilledCount(unfulfilledRes.count || 0);
      setSubscriberCount(subscribersRes.count || 0);
      setPendingAmbassadors(ambassadorsRes.count || 0);
      setRecentOrders(ordersRes.data || []);
      setLowStock(lowStockRes.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const dismissChecklist = () => {
    localStorage.setItem('admin_checklist_dismissed', 'true');
    setChecklistDismissed(true);
  };

  const showChecklist = !checklistDismissed && stats.totalProducts < 5 && recentOrders.length === 0 && !loading;

  const revenueCards = [
    { title: 'Today', value: revenue.today },
    { title: 'This Week', value: revenue.week },
    { title: 'This Month', value: revenue.month },
    { title: 'Total Revenue', value: revenue.total },
  ];

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, description: 'All products', href: '/ops-portal/products' },
    { title: 'Active', value: stats.activeProducts, icon: Eye, description: 'Visible in store', href: '/ops-portal/products' },
    { title: 'Categories', value: stats.totalCategories, icon: Tags, description: 'Product categories', href: '/ops-portal/categories' },
    { title: 'Featured', value: stats.featuredProducts, icon: TrendingUp, description: 'Featured items', href: '/ops-portal/products' },
  ];

  const fulfillmentColor = (status: string | null) => {
    if (status === 'fulfilled' || status === 'delivered') return 'default';
    if (status === 'shipped') return 'secondary';
    return 'outline';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-wider text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Operations overview</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                <Clock className="h-3 w-3 inline mr-1" />
                {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Getting Started Checklist */}
        {showChecklist && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Getting Started</CardTitle>
                <Button variant="ghost" size="sm" onClick={dismissChecklist} className="text-xs text-muted-foreground">
                  Dismiss
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/ops-portal/products/new" className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <CheckCircle2 className={`h-4 w-4 ${stats.totalProducts > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm">Add your first product</span>
                <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
              </Link>
              <Link to="/ops-portal/categories" className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <CheckCircle2 className={`h-4 w-4 ${stats.totalCategories > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm">Create product categories</span>
                <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
              </Link>
              <Link to="/ops-portal/discounts" className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Set up discount codes</span>
                <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Revenue Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-light">{loading ? '—' : formatCurrency(card.value)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Product Stats + Action Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.href}>
                <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-light">{loading ? '—' : card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Action Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/ops-portal/orders">
            <Card className={`cursor-pointer hover:border-primary/50 transition-colors ${unfulfilledCount > 0 ? 'border-amber-500/50' : ''}`}>
              <CardContent className="pt-5 pb-4 flex items-center gap-3">
                <ShoppingBag className={`h-5 w-5 ${unfulfilledCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <div>
                  <div className="text-lg font-light">{loading ? '—' : unfulfilledCount}</div>
                  <p className="text-xs text-muted-foreground">Needs Fulfillment</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-lg font-light">{loading ? '—' : subscriberCount}</div>
                <p className="text-xs text-muted-foreground">Newsletter Subscribers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <Megaphone className={`h-5 w-5 ${pendingAmbassadors > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <div className="text-lg font-light">{loading ? '—' : pendingAmbassadors}</div>
                <p className="text-xs text-muted-foreground">Pending Ambassadors</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent Orders</CardTitle>
              <Link to="/ops-portal/orders" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/ops-portal/orders/${order.id}`}
                      className="flex items-center justify-between py-2 hover:bg-secondary/30 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm">{order.customer_email}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d')}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-medium">{formatCurrency(order.total_cents)}</p>
                        <div className="flex gap-1">
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                            {order.payment_status}
                          </Badge>
                          {order.fulfillment_status && (
                            <Badge variant={fulfillmentColor(order.fulfillment_status)} className="text-[10px]">
                              {order.fulfillment_status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 inline mr-2 text-amber-500" />
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">All stock levels healthy</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.map((v) => (
                    <Link
                      key={v.id}
                      to={v.product?.id ? `/ops-portal/products/${v.product.id}/edit` : '#'}
                      className="flex items-center justify-between py-1.5 text-sm hover:bg-secondary/30 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <span className="font-medium">{v.product?.name || 'Unknown'}</span>
                        <span className="text-muted-foreground ml-2">
                          {[v.size, v.color].filter(Boolean).join(' / ') || 'Default'}
                        </span>
                      </div>
                      <Badge variant={v.stock_quantity === 0 ? 'destructive' : 'secondary'} className="text-xs">
                        {v.stock_quantity} left
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/ops-portal/products/new" className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="text-sm font-medium">Add New Product</div>
                <div className="text-xs text-muted-foreground mt-1">Create product with variants and images</div>
              </Link>
              <Link to="/ops-portal/categories" className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="text-sm font-medium">Manage Categories</div>
                <div className="text-xs text-muted-foreground mt-1">Organize your product catalog</div>
              </Link>
              <Link to="/ops-portal/orders" className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="text-sm font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  View Orders
                </div>
                <div className="text-xs text-muted-foreground mt-1">Track and fulfill customer orders</div>
              </Link>
              <Link to="/ops-portal/lookbook" className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  Manage Lookbook
                </div>
                <div className="text-xs text-muted-foreground mt-1">Add, edit, and reorder lookbook sections</div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
