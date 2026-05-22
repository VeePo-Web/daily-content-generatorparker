import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Loader2, Wand2 } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Inline stock editor component
const InlineStockEdit = ({ variantId, value, onSave }: { variantId: string; value: number; onSave: (v: number) => void }) => {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(value);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const save = async () => {
    if (qty === value) { setEditing(false); return; }
    setSaving(true);
    const { error } = await supabase.from('product_variants').update({ stock_quantity: qty }).eq('id', variantId);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
      setQty(value);
    } else {
      onSave(qty);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        type="number"
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value) || 0)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setQty(value); setEditing(false); } }}
        className="h-7 w-16 text-xs"
        autoFocus
        disabled={saving}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-sm hover:bg-secondary px-2 py-0.5 rounded cursor-pointer transition-colors"
      title="Click to edit stock"
    >
      {value}
    </button>
  );
};

interface Variant {
  id: string;
  size: string | null;
  color: string | null;
  style: string | null;
  sku: string | null;
  stock_quantity: number;
  price_adjustment: number | null;
  product_id: string;
}

interface VariantManagerProps {
  productId: string | null;
  productSlug: string;
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const VariantManager = ({ productId, productSlug }: VariantManagerProps) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    style: '',
    sku: '',
    stock_quantity: 0,
    price_adjustment: 0,
  });
  const { toast } = useToast();

  const fetchVariants = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setVariants(data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load variants', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const generateSku = (size: string, color: string) => {
    const slugPart = productSlug.slice(0, 8).toUpperCase().replace(/-/g, '');
    const sizePart = size.toUpperCase().slice(0, 3);
    const colorPart = color ? `-${color.toUpperCase().slice(0, 3)}` : '';
    return `${slugPart}-${sizePart}${colorPart}`;
  };

  const addVariant = async () => {
    if (!productId) {
      toast({ title: 'Save product first', description: 'Create the product before adding variants.', variant: 'destructive' });
      return;
    }

    if (!newVariant.size && !newVariant.color && !newVariant.style) {
      toast({ title: 'Missing info', description: 'Enter at least a size, color, or style.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const sku = newVariant.sku || generateSku(newVariant.size, newVariant.color);
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          size: newVariant.size || null,
          color: newVariant.color || null,
          style: newVariant.style || null,
          sku,
          stock_quantity: newVariant.stock_quantity,
          price_adjustment: newVariant.price_adjustment || null,
        })
        .select()
        .single();

      if (error) throw error;
      setVariants((prev) => [...prev, data]);
      setNewVariant({ size: '', color: '', style: '', sku: '', stock_quantity: 0, price_adjustment: 0 });
      toast({ title: 'Variant added' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add variant', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteVariant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to delete variant', variant: 'destructive' });
    }
  };

  const bulkGenerateSizes = async () => {
    if (!productId) {
      toast({ title: 'Save product first', variant: 'destructive' });
      return;
    }

    const existingSizes = new Set(variants.map((v) => v.size));
    const toCreate = STANDARD_SIZES.filter((s) => !existingSizes.has(s));

    if (toCreate.length === 0) {
      toast({ title: 'All standard sizes exist' });
      return;
    }

    setSaving(true);
    try {
      const rows = toCreate.map((size) => ({
        product_id: productId,
        size,
        sku: generateSku(size, ''),
        stock_quantity: 0,
      }));

      const { data, error } = await supabase
        .from('product_variants')
        .insert(rows)
        .select();

      if (error) throw error;
      setVariants((prev) => [...prev, ...(data || [])]);
      toast({ title: `${toCreate.length} sizes generated` });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate sizes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!productId) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Save the product first to add variants.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Variants ({variants.length})
        </h3>
        <Button variant="outline" size="sm" onClick={bulkGenerateSizes} disabled={saving}>
          <Wand2 className="h-3.5 w-3.5 mr-2" />
          Generate S–XXL
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase tracking-wider">Size</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Color</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Style</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">SKU</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Stock</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Price Adj.</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.size || '—'}</TableCell>
                  <TableCell>{v.color || '—'}</TableCell>
                  <TableCell>{v.style || '—'}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{v.sku || '—'}</TableCell>
                  <TableCell>
                    <InlineStockEdit
                      variantId={v.id}
                      value={v.stock_quantity}
                      onSave={(newQty) => {
                        setVariants((prev) => prev.map((x) => x.id === v.id ? { ...x, stock_quantity: newQty } : x));
                      }}
                    />
                  </TableCell>
                  <TableCell>{v.price_adjustment ? `+$${v.price_adjustment}` : '—'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setDeleteConfirmId(v.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Add variant row */}
              <TableRow className="bg-secondary/30">
                <TableCell>
                  <Input
                    value={newVariant.size}
                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                    placeholder="S"
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newVariant.color}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                    placeholder="Black"
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newVariant.style}
                    onChange={(e) => setNewVariant({ ...newVariant, style: e.target.value })}
                    placeholder="Classic"
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                    placeholder="Auto"
                    className="h-8 text-xs font-mono"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newVariant.stock_quantity}
                    onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="h-8 text-xs w-16"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newVariant.price_adjustment}
                    onChange={(e) => setNewVariant({ ...newVariant, price_adjustment: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-xs w-20"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={addVariant}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const v = variants.find((x) => x.id === deleteConfirmId);
                const label = v ? [v.size, v.color].filter(Boolean).join(' / ') || 'Default' : '';
                return `Delete variant "${label}"? Its SKU, stock count, and price adjustment will be lost.`;
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteConfirmId) deleteVariant(deleteConfirmId); setDeleteConfirmId(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VariantManager;
