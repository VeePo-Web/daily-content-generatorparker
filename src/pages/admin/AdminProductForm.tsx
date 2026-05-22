import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import VariantManager from '@/components/admin/VariantManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Send, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { Database } from '@/integrations/supabase/types';

type ProductStatus = Database['public']['Enums']['product_status'];

interface Category {
  id: string;
  name: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const FIT_TYPES = ['Slim', 'Regular', 'Relaxed', 'Oversized'];

const AdminProductForm = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!productId;

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [ministryStatement, setMinistryStatement] = useState('');
  const [status, setStatus] = useState<ProductStatus>('draft');
  const [categoryId, setCategoryId] = useState<string>('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [material, setMaterial] = useState('');
  const [fabricComposition, setFabricComposition] = useState('');
  const [weightGsm, setWeightGsm] = useState('');
  const [fitType, setFitType] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [modelInfo, setModelInfo] = useState('');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [savedProductId, setSavedProductId] = useState<string | null>(productId || null);

  const {
    images,
    uploads,
    fetchImages,
    uploadFiles,
    deleteImage,
    setPrimary,
    updateAltText,
  } = useImageUpload(savedProductId);

  // Fetch categories
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('display_order');
      setCategories(data || []);
    };
    load();
  }, []);

  // Fetch product for edit
  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      setLoadingProduct(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error || !data) throw error;

        setName(data.name);
        setSlug(data.slug);
        setDescription(data.description || '');
        setMinistryStatement(data.ministry_statement || '');
        setStatus(data.status);
        setCategoryId(data.category_id || '');
        setPrice(String(data.price));
        setSalePrice(data.sale_price ? String(data.sale_price) : '');
        setIsOnSale(data.is_on_sale);
        setIsFeatured(data.is_featured);
        setMaterial(data.material || '');
        setFabricComposition(data.fabric_composition || '');
        setWeightGsm(data.weight_gsm ? String(data.weight_gsm) : '');
        setFitType(data.fit_type || '');
        setCareInstructions(data.care_instructions || '');
        setModelInfo(data.model_info || '');
        setFaqs((data.common_questions as unknown as FAQItem[]) || []);
      } catch {
        toast({ title: 'Error', description: 'Product not found', variant: 'destructive' });
        navigate('/ops-portal/products');
      } finally {
        setLoadingProduct(false);
      }
    };
    load();
  }, [productId, navigate, toast]);

  // Fetch images when product ID is available
  useEffect(() => {
    if (savedProductId) fetchImages();
  }, [savedProductId, fetchImages]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit) setSlug(generateSlug(value));
  };

  const save = useCallback(async (publishStatus: ProductStatus) => {
    if (!name.trim()) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast({ title: 'Valid price required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        description: description.trim() || null,
        ministry_statement: ministryStatement.trim() || null,
        status: publishStatus,
        category_id: categoryId || null,
        price: parseFloat(price),
        sale_price: salePrice ? parseFloat(salePrice) : null,
        is_on_sale: isOnSale && !!salePrice,
        is_featured: isFeatured,
        material: material.trim() || null,
        fabric_composition: fabricComposition.trim() || null,
        weight_gsm: weightGsm ? parseInt(weightGsm) : null,
        fit_type: fitType || null,
        care_instructions: careInstructions.trim() || null,
        model_info: modelInfo.trim() || null,
        common_questions: faqs.length > 0 ? (faqs as unknown as Database['public']['Tables']['products']['Insert']['common_questions']) : null,
      };

      if (isEdit && productId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);

        if (error) throw error;
        toast({ title: 'Product updated' });
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();

        if (error) throw error;
        setSavedProductId(data.id);
        toast({ title: 'Product created' });
        // Navigate to edit mode so subsequent saves are updates
        navigate(`/ops-portal/products/${data.id}/edit`, { replace: true });
      }
    } catch (err: any) {
      const msg = err?.code === '23505' ? 'A product with this slug already exists' : 'Failed to save product';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [name, slug, description, ministryStatement, categoryId, price, salePrice, isOnSale, isFeatured, material, fabricComposition, weightGsm, fitType, careInstructions, modelInfo, faqs, isEdit, productId, navigate, toast]);

  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const updateFaq = (i: number, field: 'question' | 'answer', value: string) =>
    setFaqs(faqs.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)));
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));

  if (loadingProduct) {
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
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ops-portal/products')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-light tracking-wider text-foreground">
                {isEdit ? 'Edit Product' : 'New Product'}
              </h1>
              {savedProductId && (
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  ID: {savedProductId.slice(0, 8)}…
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => save('draft')}
              disabled={saving}
              className="text-xs uppercase tracking-wider"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => save('active')}
              disabled={saving}
              className="text-xs uppercase tracking-wider"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {isEdit ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* Tabbed form */}
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics" className="text-xs uppercase tracking-wider">Basics</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs uppercase tracking-wider">Pricing</TabsTrigger>
            <TabsTrigger value="images" className="text-xs uppercase tracking-wider">Images</TabsTrigger>
            <TabsTrigger value="details" className="text-xs uppercase tracking-wider">Details</TabsTrigger>
          </TabsList>

          {/* TAB 1: BASICS */}
          <TabsContent value="basics" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Product Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Name</Label>
                  <Input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Stay Holy Hoodie" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="stay-holy-hoodie" />
                  <p className="text-xs text-muted-foreground">/product/{slug || 'your-slug'}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={4} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Ministry Statement</Label>
                  <Textarea value={ministryStatement} onChange={(e) => setMinistryStatement(e.target.value)} placeholder="The purpose behind this piece..." rows={3} />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use the default faith statement. Your custom text will appear in "The Purpose" section on the product page.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Status</Label>
                  <RadioGroup value={status} onValueChange={(v) => setStatus(v as ProductStatus)} className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="draft" id="status-draft" />
                      <Label htmlFor="status-draft" className="text-sm cursor-pointer">Draft</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="active" id="status-active" />
                      <Label htmlFor="status-active" className="text-sm cursor-pointer">Active</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="archived" id="status-archived" />
                      <Label htmlFor="status-archived" className="text-sm cursor-pointer">Archived</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: PRICING + VARIANTS */}
          <TabsContent value="pricing" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">Price ($)</Label>
                    <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49.99" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">Sale Price ($)</Label>
                    <Input type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="39.99" />
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <Switch checked={isOnSale} onCheckedChange={setIsOnSale} id="on-sale" />
                    <Label htmlFor="on-sale" className="text-sm cursor-pointer">On Sale</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} id="featured" />
                    <Label htmlFor="featured" className="text-sm cursor-pointer">Featured</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VariantManager productId={savedProductId} productSlug={slug || 'product'} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: IMAGES */}
          <TabsContent value="images" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  images={images}
                  uploads={uploads}
                  onUpload={uploadFiles}
                  onDelete={deleteImage}
                  onSetPrimary={setPrimary}
                  onUpdateAltText={updateAltText}
                  disabled={!savedProductId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: DETAILS */}
          <TabsContent value="details" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Fabric & Fit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">Material</Label>
                    <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="100% Cotton" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">Fabric Composition</Label>
                    <Input value={fabricComposition} onChange={(e) => setFabricComposition(e.target.value)} placeholder="80% Cotton, 20% Polyester" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">Weight (GSM)</Label>
                    <Input type="number" value={weightGsm} onChange={(e) => setWeightGsm(e.target.value)} placeholder="320" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">Fit Type</Label>
                    <Select value={fitType} onValueChange={setFitType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fit" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIT_TYPES.map((f) => (
                          <SelectItem key={f} value={f.toLowerCase()}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Care Instructions</Label>
                  <Textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} placeholder="Machine wash cold, tumble dry low..." rows={3} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider">Model Info</Label>
                  <Input value={modelInfo} onChange={(e) => setModelInfo(e.target.value)} placeholder="Model is 6'1&quot;, wearing size L" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Common Questions
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addFaq}>
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Add FAQ
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No FAQs yet.</p>
                )}
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-border rounded-md p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={faq.question}
                          onChange={(e) => updateFaq(i, 'question', e.target.value)}
                          placeholder="Question"
                          className="text-sm"
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFaq(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                      placeholder="Answer"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
