import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  products?: { id: string }[];
}

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, products(id)')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || '');
    } else {
      setEditingCategory(null);
      setName('');
      setSlug('');
      setDescription('');
    }
    setDialogOpen(true);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingCategory) setSlug(generateSlug(value));
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast({ title: 'Validation Error', description: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ name: name.trim(), slug: slug.trim(), description: description.trim() || null })
          .eq('id', editingCategory.id);
        if (error) throw error;
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: name.trim(), slug: slug.trim(), description: description.trim() || null } : c));
        toast({ title: 'Category updated' });
      } else {
        const maxOrder = Math.max(...categories.map(c => c.display_order), -1);
        const { data, error } = await supabase
          .from('categories')
          .insert({ name: name.trim(), slug: slug.trim(), description: description.trim() || null, display_order: maxOrder + 1 })
          .select()
          .single();
        if (error) throw error;
        setCategories([...categories, data]);
        toast({ title: 'Category created' });
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.code === '23505' ? 'Slug already exists' : 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', deleteId);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== deleteId));
      toast({ title: 'Category deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-wider text-foreground">Categories</h1>
            <p className="text-sm text-muted-foreground mt-1">Organize your products into categories</p>
          </div>
          <Button onClick={() => openDialog()} size="sm" className="text-xs uppercase tracking-wider">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Slug</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-center">Products</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Description</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No categories yet. Add your first category!
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{category.products?.length || 0}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{category.description || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(category.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wider">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">Name</Label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g., T-Shirts" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g., t-shirts" />
              <p className="text-xs text-muted-foreground">/category/{slug || 'your-slug'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">Description (Optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>Products in this category will be uncategorized.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCategories;
