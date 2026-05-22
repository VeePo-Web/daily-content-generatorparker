import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  status: 'draft' | 'active' | 'archived';
  is_featured: boolean;
  is_on_sale: boolean;
  category: { name: string } | null;
  created_at: string;
  primary_image?: string | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, price, sale_price, status, is_featured, is_on_sale, created_at, category:categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch primary images
      const productIds = (data || []).map((p) => p.id);
      let imageMap: Record<string, string> = {};

      if (productIds.length > 0) {
        const { data: images } = await supabase
          .from('product_images')
          .select('product_id, image_url')
          .in('product_id', productIds)
          .eq('is_primary', true);

        if (images) {
          images.forEach((img) => {
            imageMap[img.product_id] = img.image_url;
          });
        }
      }

      setProducts(
        (data || []).map((p) => ({
          ...p,
          primary_image: imageMap[p.id] || null,
        }))
      );
    } catch {
      toast({ title: 'Error', description: 'Failed to load products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', deleteId);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== deleteId));
      toast({ title: 'Product deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusTab === 'all' || p.status === statusTab;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'archived': return <Badge variant="outline">Archived</Badge>;
      default: return null;
    }
  };

  const counts = {
    all: products.length,
    active: products.filter((p) => p.status === 'active').length,
    draft: products.filter((p) => p.status === 'draft').length,
    archived: products.filter((p) => p.status === 'archived').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-wider text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {products.length} products in catalog
            </p>
          </div>
          <Button asChild size="sm" className="text-xs uppercase tracking-wider">
            <Link to="/ops-portal/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList>
            <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="draft" className="text-xs">Draft ({counts.draft})</TabsTrigger>
            <TabsTrigger value="archived" className="text-xs">Archived ({counts.archived})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider w-12"></TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Product</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Price</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Tags</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search ? 'No products found' : 'No products yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/ops-portal/products/${product.id}/edit`)}>
                    <TableCell>
                      {product.primary_image ? (
                        <img src={product.primary_image} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-secondary" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.category?.name || '—'}</TableCell>
                    <TableCell>
                      {product.is_on_sale && product.sale_price ? (
                        <div>
                          <span className="line-through text-muted-foreground mr-2">${product.price}</span>
                          <span className="text-destructive">${product.sale_price}</span>
                        </div>
                      ) : (
                        `$${product.price}`
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.is_featured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                        {product.is_on_sale && <Badge variant="outline" className="text-xs text-destructive border-destructive">Sale</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/ops-portal/products/${product.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All variants and images will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProducts;
