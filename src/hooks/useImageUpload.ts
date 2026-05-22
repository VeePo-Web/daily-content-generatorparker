import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;

export interface UploadedImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  product_id: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

export const useImageUpload = (productId: string | null) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchImages = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load images', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [productId, toast]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return `${file.name}: Only JPG, PNG, WebP allowed`;
    if (file.size > MAX_SIZE) return `${file.name}: Max 5MB`;
    return null;
  };

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!productId) {
      toast({ title: 'Save product first', description: 'Create the product before uploading images.', variant: 'destructive' });
      return;
    }

    if (images.length + files.length > MAX_IMAGES) {
      toast({ title: 'Too many images', description: `Maximum ${MAX_IMAGES} images per product.`, variant: 'destructive' });
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      const err = validateFile(file);
      if (err) {
        toast({ title: 'Invalid file', description: err, variant: 'destructive' });
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    const newUploads: UploadProgress[] = validFiles.map((f) => ({
      fileName: f.name,
      progress: 0,
      status: 'uploading' as const,
    }));
    setUploads((prev) => [...prev, ...newUploads]);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file, { contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(path);

        const nextOrder = images.length + i;
        const isPrimary = images.length === 0 && i === 0;

        const { data: imgRow, error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: urlData.publicUrl,
            display_order: nextOrder,
            is_primary: isPrimary,
            alt_text: file.name.replace(/\.[^.]+$/, ''),
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setImages((prev) => [...prev, imgRow]);
        setUploads((prev) =>
          prev.map((u) =>
            u.fileName === file.name ? { ...u, progress: 100, status: 'done' as const } : u
          )
        );
      } catch {
        setUploads((prev) =>
          prev.map((u) =>
            u.fileName === file.name ? { ...u, status: 'error' as const } : u
          )
        );
        toast({ title: 'Upload failed', description: `Failed to upload ${file.name}`, variant: 'destructive' });
      }
    }

    // Clear completed uploads after a delay
    setTimeout(() => setUploads([]), 3000);
  }, [productId, images, toast]);

  const deleteImage = useCallback(async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      toast({ title: 'Error', description: 'Failed to delete image', variant: 'destructive' });
    }
  }, [toast]);

  const setPrimary = useCallback(async (imageId: string) => {
    if (!productId) return;
    try {
      // Unset all primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);

      // Set new primary
      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      setImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      );
    } catch {
      toast({ title: 'Error', description: 'Failed to set primary image', variant: 'destructive' });
    }
  }, [productId, toast]);

  const updateAltText = useCallback(async (imageId: string, altText: string) => {
    try {
      await supabase
        .from('product_images')
        .update({ alt_text: altText })
        .eq('id', imageId);

      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, alt_text: altText } : img))
      );
    } catch {
      toast({ title: 'Error', description: 'Failed to update alt text', variant: 'destructive' });
    }
  }, [toast]);

  return {
    images,
    uploads,
    loading,
    fetchImages,
    uploadFiles,
    deleteImage,
    setPrimary,
    updateAltText,
  };
};
