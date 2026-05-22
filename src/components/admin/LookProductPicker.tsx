import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export interface LookProduct {
  product_id: string;
  position: string | null;
  display_order: number;
  // hydrated client-side
  name?: string;
  price?: number;
  image_url?: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

interface Props {
  value: LookProduct[];
  onChange: (next: LookProduct[]) => void;
}

const POSITIONS = ['top', 'bottom', 'outerwear', 'accessory', 'footwear'];

const LookProductPicker = ({ value, onChange }: Props) => {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Hydrate value rows with product details
  useEffect(() => {
    const missing = value.filter((v) => !v.name).map((v) => v.product_id);
    if (!missing.length) return;
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, product_images(image_url, is_primary)')
        .in('id', missing);
      if (!data) return;
      const map: Record<string, { name: string; price: number; image_url: string | null }> = {};
      data.forEach((p: any) => {
        const primary = (p.product_images || []).find((i: any) => i.is_primary) || (p.product_images || [])[0];
        map[p.id] = { name: p.name, price: p.price, image_url: primary?.image_url || null };
      });
      onChange(value.map((v) => (map[v.product_id] ? { ...v, ...map[v.product_id] } : v)));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.map((v) => v.product_id).join(',')]);

  // Search
  useEffect(() => {
    if (!search.trim()) {
      setOptions([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, product_images(image_url, is_primary)')
        .eq('status', 'active')
        .ilike('name', `%${search}%`)
        .limit(8);
      setOptions(
        (data || []).map((p: any) => {
          const primary = (p.product_images || []).find((i: any) => i.is_primary) || (p.product_images || [])[0];
          return { id: p.id, name: p.name, price: p.price, image_url: primary?.image_url || null };
        })
      );
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  const addedIds = useMemo(() => new Set(value.map((v) => v.product_id)), [value]);

  const addProduct = (p: ProductOption) => {
    if (addedIds.has(p.id)) return;
    const nextOrder = value.length ? Math.max(...value.map((v) => v.display_order)) + 1 : 0;
    onChange([
      ...value,
      { product_id: p.id, position: 'top', display_order: nextOrder, name: p.name, price: p.price, image_url: p.image_url },
    ]);
    setSearch('');
    setOptions([]);
    setShowResults(false);
  };

  const remove = (id: string) => onChange(value.filter((v) => v.product_id !== id));
  const updatePosition = (id: string, position: string) =>
    onChange(value.map((v) => (v.product_id === id ? { ...v, position } : v)));

  const move = (id: string, dir: 'up' | 'down') => {
    const sorted = [...value].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((v) => v.product_id === id);
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    onChange(value.map((v) => {
      if (v.product_id === a.product_id) return { ...v, display_order: b.display_order };
      if (v.product_id === b.product_id) return { ...v, display_order: a.display_order };
      return v;
    }));
  };

  const sortedValue = [...value].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search active products by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          className="pl-10"
        />
        {showResults && options.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-72 overflow-y-auto">
            {options.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addProduct(p)}
                disabled={addedIds.has(p.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-secondary/60 text-left disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-secondary" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">${p.price}</p>
                </div>
                {addedIds.has(p.id) && <span className="text-[10px] uppercase text-muted-foreground">Added</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assigned list */}
      {sortedValue.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-md">
          No products in this look yet. Search above to add.
        </p>
      ) : (
        <div className="space-y-2">
          {sortedValue.map((lp) => (
            <div key={lp.product_id} className="flex items-center gap-3 p-2 border border-border rounded-md bg-card">
              <div className="flex flex-col">
                <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => move(lp.product_id, 'up')}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => move(lp.product_id, 'down')}>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              {lp.image_url ? (
                <img src={lp.image_url} alt="" className="w-10 h-10 rounded object-cover" />
              ) : (
                <div className="w-10 h-10 rounded bg-secondary" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{lp.name || lp.product_id}</p>
                {lp.price !== undefined && <p className="text-xs text-muted-foreground">${lp.price}</p>}
              </div>
              <Select value={lp.position || 'top'} onValueChange={(v) => updatePosition(lp.product_id, v)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(lp.product_id)}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LookProductPicker;
