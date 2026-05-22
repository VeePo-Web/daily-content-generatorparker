import { useEffect, useState, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Plus, Search, Pencil, Trash2, Loader2, Copy, ChevronUp, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Look {
  id: string;
  name: string;
  headline: string;
  scripture_reference: string | null;
  image_url: string;
  gender: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  product_count?: number;
}

const AdminLookbook = () => {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchLooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lookbook_looks')
        .select('id, name, headline, scripture_reference, image_url, gender, is_active, display_order, created_at')
        .order('display_order', { ascending: true });
      if (error) throw error;

      const ids = (data || []).map((l) => l.id);
      let counts: Record<string, number> = {};
      if (ids.length) {
        const { data: lps } = await supabase
          .from('lookbook_look_products')
          .select('look_id')
          .in('look_id', ids);
        (lps || []).forEach((lp) => {
          counts[lp.look_id] = (counts[lp.look_id] || 0) + 1;
        });
      }

      setLooks((data || []).map((l) => ({ ...l, product_count: counts[l.id] || 0 })));
    } catch {
      toast({ title: 'Error', description: 'Failed to load looks', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLooks();
  }, [fetchLooks]);

  const toggleActive = async (look: Look) => {
    setBusyId(look.id);
    const next = !look.is_active;
    setLooks((prev) => prev.map((l) => (l.id === look.id ? { ...l, is_active: next } : l)));
    const { error } = await supabase
      .from('lookbook_looks')
      .update({ is_active: next })
      .eq('id', look.id);
    if (error) {
      toast({ title: 'Error', description: 'Could not update status', variant: 'destructive' });
      setLooks((prev) => prev.map((l) => (l.id === look.id ? { ...l, is_active: !next } : l)));
    } else {
      toast({ title: next ? 'Look published' : 'Look hidden' });
    }
    setBusyId(null);
  };

  const moveOrder = async (look: Look, direction: 'up' | 'down') => {
    const sorted = [...looks].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((l) => l.id === look.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    setBusyId(look.id);
    const { error: e1 } = await supabase.from('lookbook_looks').update({ display_order: other.display_order }).eq('id', look.id);
    const { error: e2 } = await supabase.from('lookbook_looks').update({ display_order: look.display_order }).eq('id', other.id);
    if (e1 || e2) {
      toast({ title: 'Reorder failed', variant: 'destructive' });
    }
    await fetchLooks();
    setBusyId(null);
  };

  const duplicateLook = async (look: Look) => {
    setBusyId(look.id);
    try {
      const { data: source, error: sErr } = await supabase
        .from('lookbook_looks')
        .select('*')
        .eq('id', look.id)
        .single();
      if (sErr || !source) throw sErr;

      const { id, created_at, ...rest } = source as any;
      const maxOrder = Math.max(0, ...looks.map((l) => l.display_order));
      const { data: created, error: cErr } = await supabase
        .from('lookbook_looks')
        .insert({ ...rest, name: `${source.name} (Copy)`, is_active: false, display_order: maxOrder + 1 })
        .select('id')
        .single();
      if (cErr || !created) throw cErr;

      const { data: lps } = await supabase
        .from('lookbook_look_products')
        .select('product_id, position, display_order')
        .eq('look_id', look.id);

      if (lps && lps.length) {
        await supabase.from('lookbook_look_products').insert(
          lps.map((lp) => ({ ...lp, look_id: created.id }))
        );
      }
      toast({ title: 'Look duplicated' });
      await fetchLooks();
    } catch {
      toast({ title: 'Duplicate failed', variant: 'destructive' });
    }
    setBusyId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setBusyId(deleteId);
    try {
      await supabase.from('lookbook_look_products').delete().eq('look_id', deleteId);
      const { error } = await supabase.from('lookbook_looks').delete().eq('id', deleteId);
      if (error) throw error;
      setLooks((prev) => prev.filter((l) => l.id !== deleteId));
      toast({ title: 'Look deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    } finally {
      setBusyId(null);
      setDeleteId(null);
    }
  };

  const filtered = looks.filter((l) => {
    const s = search.toLowerCase();
    const matchesSearch = !s || l.name.toLowerCase().includes(s) || l.headline.toLowerCase().includes(s);
    const matchesStatus = statusTab === 'all' || (statusTab === 'active' ? l.is_active : !l.is_active);
    const matchesGender = genderFilter === 'all' || l.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesGender;
  });

  const counts = {
    all: looks.length,
    active: looks.filter((l) => l.is_active).length,
    inactive: looks.filter((l) => !l.is_active).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-wider text-foreground">Lookbook</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {counts.active} active {counts.active === 1 ? 'look' : 'looks'} on the live site
            </p>
          </div>
          <Button asChild size="sm" className="text-xs uppercase tracking-wider">
            <Link to="/ops-portal/lookbook/new">
              <Plus className="h-4 w-4 mr-2" />
              New Look
            </Link>
          </Button>
        </div>

        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList>
            <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs">Hidden ({counts.inactive})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or headline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="unisex">Unisex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-xs uppercase tracking-wider">Order</TableHead>
                <TableHead className="w-14 text-xs uppercase tracking-wider"></TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Look</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Gender</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Products</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Created</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                    {looks.length === 0 ? (
                      <div className="space-y-3">
                        <p>No looks yet. Create your first look to start telling stories.</p>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/ops-portal/lookbook/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Look
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      'No looks match your filters.'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((look) => (
                  <TableRow
                    key={look.id}
                    className="cursor-pointer hover:bg-secondary/50"
                    onClick={() => navigate(`/ops-portal/lookbook/${look.id}/edit`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground w-6">{look.display_order}</span>
                        <div className="flex flex-col">
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveOrder(look, 'up')} disabled={busyId === look.id}>
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveOrder(look, 'down')} disabled={busyId === look.id}>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {look.image_url ? (
                        <img src={look.image_url} alt="" className="w-10 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-12 bg-secondary rounded" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{look.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{look.headline}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize text-xs">{look.gender}</TableCell>
                    <TableCell className="text-sm">{look.product_count}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleActive(look)}
                        disabled={busyId === look.id}
                        className="cursor-pointer"
                      >
                        {look.is_active ? (
                          <Badge className="bg-green-600 text-white">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(look.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="Edit">
                          <Link to={`/ops-portal/lookbook/${look.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => duplicateLook(look)} disabled={busyId === look.id} title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(look.id)} title="Delete">
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
            <AlertDialogTitle>Delete this look?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the look from the public Lookbook. Its product mappings are also removed (products themselves are not deleted).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminLookbook;
