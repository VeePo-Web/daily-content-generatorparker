import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Loader2, Percent, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DiscountCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_order_cents: number | null;
  maximum_discount_cents: number | null;
  usage_limit: number | null;
  usage_count: number | null;
  per_user_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

const emptyForm = {
  code: '',
  name: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 0,
  minimum_order_cents: 0,
  maximum_discount_cents: 0,
  usage_limit: 0,
  per_user_limit: 1,
  starts_at: '',
  expires_at: '',
  is_active: true,
};

const AdminDiscounts = () => {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: 'Failed to load discount codes', variant: 'destructive' });
    } else {
      setCodes(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (code: DiscountCode) => {
    setEditingId(code.id);
    const isFixed = code.discount_type === 'fixed';
    setForm({
      code: code.code,
      name: code.name,
      description: code.description || '',
      discount_type: code.discount_type,
      discount_value: isFixed ? code.discount_value / 100 : code.discount_value,
      minimum_order_cents: code.minimum_order_cents ? code.minimum_order_cents / 100 : 0,
      maximum_discount_cents: code.maximum_discount_cents ? code.maximum_discount_cents / 100 : 0,
      usage_limit: code.usage_limit || 0,
      per_user_limit: code.per_user_limit || 1,
      starts_at: code.starts_at ? code.starts_at.slice(0, 16) : '',
      expires_at: code.expires_at ? code.expires_at.slice(0, 16) : '',
      is_active: code.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.name || !form.discount_value) {
      toast({ title: 'Missing fields', description: 'Code, name, and value are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const isFixed = form.discount_type === 'fixed';
    const payload = {
      code: form.code.toUpperCase().trim(),
      name: form.name,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: isFixed ? Math.round(form.discount_value * 100) : form.discount_value,
      minimum_order_cents: form.minimum_order_cents ? Math.round(form.minimum_order_cents * 100) : null,
      maximum_discount_cents: form.maximum_discount_cents ? Math.round(form.maximum_discount_cents * 100) : null,
      usage_limit: form.usage_limit || null,
      per_user_limit: form.per_user_limit || null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('discount_codes').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('discount_codes').insert(payload));
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editingId ? 'Code updated' : 'Code created' });
      setDialogOpen(false);
      fetchCodes();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, currentState: boolean | null) => {
    const newState = !(currentState ?? true);
    setCodes((prev) => prev.map((c) => c.id === id ? { ...c, is_active: newState } : c));
    const { error } = await supabase.from('discount_codes').update({ is_active: newState }).eq('id', id);
    if (error) {
      setCodes((prev) => prev.map((c) => c.id === id ? { ...c, is_active: currentState } : c));
      toast({ title: 'Error', description: 'Failed to toggle', variant: 'destructive' });
    }
  };

  const deleteCode = async (id: string) => {
    const prev = codes;
    setCodes((c) => c.filter((x) => x.id !== id));
    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    if (error) {
      setCodes(prev);
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } else {
      toast({ title: 'Code deleted' });
    }
  };

  const formatValue = (type: string, value: number) =>
    type === 'percentage' ? `${value}%` : `$${(value / 100).toFixed(2)}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-wider text-foreground">Discount Codes</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage promotional discounts</p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Code
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : codes.length === 0 ? (
              <div className="py-12 text-center">
                <Percent className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No discount codes yet</p>
                <Button variant="outline" size="sm" onClick={openCreate} className="mt-3">
                  Create your first code
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase tracking-wider">Code</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Discount</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Usage</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Expires</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider">Active</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs font-medium">{c.code}</TableCell>
                        <TableCell className="text-sm">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {formatValue(c.discount_type, c.discount_value)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.usage_count || 0}{c.usage_limit ? ` / ${c.usage_limit}` : ''}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.expires_at ? format(new Date(c.expires_at), 'MMM d, yyyy') : '—'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={c.is_active ?? true}
                            onCheckedChange={() => toggleActive(c.id, c.is_active)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteConfirmId(c.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium uppercase tracking-wider">
              {editingId ? 'Edit Discount Code' : 'New Discount Code'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SAVE20" className="font-mono uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer Sale" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Type</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">
                  Value {form.discount_type === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Min Order ($)</Label>
                <Input type="number" step="0.01" value={form.minimum_order_cents} onChange={(e) => setForm({ ...form, minimum_order_cents: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Max Discount ($)</Label>
                <Input type="number" step="0.01" value={form.maximum_discount_cents} onChange={(e) => setForm({ ...form, maximum_discount_cents: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Usage Limit</Label>
                <Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: parseInt(e.target.value) || 0 })} placeholder="0 = unlimited" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Per User Limit</Label>
                <Input type="number" value={form.per_user_limit} onChange={(e) => setForm({ ...form, per_user_limit: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Starts At</Label>
                <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider">Expires At</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label className="text-sm">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discount Code</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the code "{codes.find(c => c.id === deleteConfirmId)?.code}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmId) {
                  deleteCode(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDiscounts;
