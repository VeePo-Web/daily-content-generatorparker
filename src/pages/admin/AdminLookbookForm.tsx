import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Upload, Trash2, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LookProductPicker, { LookProduct } from '@/components/admin/LookProductPicker';

const AdminLookbookForm = () => {
  const { lookId } = useParams<{ lookId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!lookId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initial = useRef<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState('unisex');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [products, setProducts] = useState<LookProduct[]>([]);
  const [originalProductIds, setOriginalProductIds] = useState<string[]>([]);

  // Load existing look
  useEffect(() => {
    if (!lookId) {
      // For new look — auto-pick next display order
      supabase
        .from('lookbook_looks')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          const next = data && data[0] ? (data[0].display_order || 0) + 1 : 0;
          setDisplayOrder(next);
          initial.current = JSON.stringify({ next });
        });
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('lookbook_looks')
          .select('*')
          .eq('id', lookId)
          .single();
        if (error || !data) throw error;

        setName(data.name || '');
        setHeadline(data.headline || '');
        setScriptureRef(data.scripture_reference || '');
        setDescription(data.description || '');
        setGender(data.gender || 'unisex');
        setImageUrl(data.image_url || '');
        setVideoUrl(data.video_url || '');
        setIsActive(!!data.is_active);
        setDisplayOrder(data.display_order || 0);

        const { data: lps } = await supabase
          .from('lookbook_look_products')
          .select('product_id, position, display_order')
          .eq('look_id', lookId)
          .order('display_order', { ascending: true });

        const lpList = (lps || []).map((lp) => ({
          product_id: lp.product_id,
          position: lp.position,
          display_order: lp.display_order || 0,
        }));
        setProducts(lpList);
        setOriginalProductIds(lpList.map((lp) => lp.product_id));

        initial.current = JSON.stringify({
          name: data.name, headline: data.headline, scripture_reference: data.scripture_reference,
          description: data.description, gender: data.gender, image_url: data.image_url,
          video_url: data.video_url, is_active: data.is_active, display_order: data.display_order,
          products: lpList,
        });
      } catch {
        toast({ title: 'Look not found', variant: 'destructive' });
        navigate('/ops-portal/lookbook');
      } finally {
        setLoading(false);
      }
    })();
  }, [lookId, navigate, toast]);

  // Track dirty state
  useEffect(() => {
    if (loading) return;
    const current = JSON.stringify({
      name, headline, scripture_reference: scriptureRef, description, gender,
      image_url: imageUrl, video_url: videoUrl, is_active: isActive,
      display_order: displayOrder, products,
    });
    setIsDirty(current !== initial.current && initial.current !== '');
  }, [name, headline, scriptureRef, description, gender, imageUrl, videoUrl, isActive, displayOrder, products, loading]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `lookbook/${lookId || 'new'}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setImageUrl(data.publicUrl);
      toast({ title: 'Cover uploaded' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const save = useCallback(async () => {
    if (!name.trim() || !headline.trim() || !imageUrl.trim()) {
      toast({ title: 'Missing required fields', description: 'Name, headline, and cover image are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        headline: headline.trim(),
        scripture_reference: scriptureRef.trim() || null,
        description: description.trim() || null,
        gender,
        image_url: imageUrl.trim(),
        video_url: videoUrl.trim() || null,
        is_active: isActive,
        display_order: displayOrder,
      };

      let targetId = lookId;
      if (isEdit && lookId) {
        const { error } = await supabase.from('lookbook_looks').update(payload).eq('id', lookId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('lookbook_looks').insert(payload).select('id').single();
        if (error || !data) throw error;
        targetId = data.id;
      }

      // Sync products: delete removed, upsert current
      if (targetId) {
        const currentIds = new Set(products.map((p) => p.product_id));
        const toDelete = originalProductIds.filter((id) => !currentIds.has(id));
        if (toDelete.length) {
          await supabase.from('lookbook_look_products')
            .delete()
            .eq('look_id', targetId)
            .in('product_id', toDelete);
        }

        // Remove all remaining and re-insert (simpler than per-row update)
        if (products.length) {
          await supabase.from('lookbook_look_products')
            .delete()
            .eq('look_id', targetId)
            .in('product_id', products.map((p) => p.product_id));

          await supabase.from('lookbook_look_products').insert(
            products.map((p) => ({
              look_id: targetId,
              product_id: p.product_id,
              position: p.position,
              display_order: p.display_order,
            }))
          );
        }
      }

      toast({ title: isEdit ? 'Look updated' : 'Look created' });
      initial.current = JSON.stringify({
        name, headline, scripture_reference: scriptureRef, description, gender,
        image_url: imageUrl, video_url: videoUrl, is_active: isActive,
        display_order: displayOrder, products,
      });
      setIsDirty(false);

      if (!isEdit && targetId) {
        navigate(`/ops-portal/lookbook/${targetId}/edit`, { replace: true });
      }
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [name, headline, scriptureRef, description, gender, imageUrl, videoUrl, isActive, displayOrder, products, originalProductIds, isEdit, lookId, navigate, toast]);

  const handleBack = () => {
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    navigate('/ops-portal/lookbook');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-light tracking-wider text-foreground">
                {isEdit ? 'Edit Look' : 'New Look'}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isDirty ? 'Unsaved changes' : 'Saved'} · Live at /lookbook
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={save}
            disabled={saving}
            className={`text-xs uppercase tracking-wider ${isDirty ? 'ring-2 ring-primary/40' : ''}`}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEdit ? 'Save Changes' : 'Create Look'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — Editorial content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Editorial Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Name *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="The Shepherd" />
                  <p className="text-xs text-muted-foreground">Internal name. Also used in nav and as section title.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Headline *</Label>
                  <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Walk By Faith, Not By Sight" />
                  <p className="text-xs text-muted-foreground">Large display copy shown over the look.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Scripture Reference</Label>
                  <Input value={scriptureRef} onChange={(e) => setScriptureRef(e.target.value)} placeholder="2 Corinthians 5:7" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="A short editorial paragraph about this look..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">Display Order</Label>
                    <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value || '0', 10))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Products in this Look
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LookProductPicker value={products} onChange={setProducts} />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — Media + status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Cover Image *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {imageUrl ? (
                  <div className="relative group">
                    <img src={imageUrl} alt="Cover" className="w-full aspect-[3/4] object-cover rounded" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setImageUrl('')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="aspect-[3/4] border-2 border-dashed border-border rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors"
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                />
                <Button variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {imageUrl ? 'Replace' : 'Upload'} Cover
                </Button>
                <div className="pt-2 space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Or paste image URL</Label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Video URL (optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://... (mp4/webm)" />
                <p className="text-xs text-muted-foreground mt-2">Used as background motion on the look section if provided.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm cursor-pointer">Show on public Lookbook</Label>
                    <p className="text-xs text-muted-foreground mt-1">Hidden looks stay saved but won't appear on the live site.</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLookbookForm;
