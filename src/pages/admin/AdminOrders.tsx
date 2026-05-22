import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Order {
  id: string;
  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  total_cents: number;
  status: string;
  payment_status: string;
  fulfillment_status: string | null;
  created_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('orders')
          .select('id, customer_email, customer_first_name, customer_last_name, total_cents, status, payment_status, fulfillment_status, created_at')
          .order('created_at', { ascending: false })
          .limit(200);

        if (statusFilter !== 'all') query = query.eq('payment_status', statusFilter);
        if (fulfillmentFilter !== 'all') query = query.eq('fulfillment_status', fulfillmentFilter);

        const { data, error } = await query;
        if (error) throw error;
        setOrders(data || []);
      } catch {
        toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter, fulfillmentFilter, toast]);

  const filtered = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      o.customer_email.toLowerCase().includes(term) ||
      o.id.toLowerCase().includes(term) ||
      `${o.customer_first_name || ''} ${o.customer_last_name || ''}`.toLowerCase().includes(term)
    );
  });

  const paymentBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-600 text-white">Paid</Badge>;
      case 'unpaid': return <Badge variant="secondary">Unpaid</Badge>;
      case 'refunded': return <Badge variant="outline">Refunded</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const fulfillmentBadge = (status: string | null) => {
    switch (status) {
      case 'fulfilled': return <Badge className="bg-green-600 text-white">Fulfilled</Badge>;
      case 'shipped': return <Badge className="bg-blue-600 text-white">Shipped</Badge>;
      case 'delivered': return <Badge className="bg-green-700 text-white">Delivered</Badge>;
      default: return <Badge variant="outline">Unfulfilled</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-light tracking-wider text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} total orders
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Fulfillment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fulfillment</SelectItem>
              <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Order</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Customer</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Total</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Payment</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Fulfillment</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {search ? 'No orders found' : 'No orders yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/ops-portal/orders/${order.id}`)}>
                    <TableCell>
                      <Link to={`/ops-portal/orders/${order.id}`} className="font-mono text-xs text-primary hover:underline">
                        {order.id.slice(0, 8)}…
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {order.customer_first_name || order.customer_last_name
                            ? `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim()
                            : '—'}
                        </div>
                        <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${(order.total_cents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>{paymentBadge(order.payment_status)}</TableCell>
                    <TableCell>{fulfillmentBadge(order.fulfillment_status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
