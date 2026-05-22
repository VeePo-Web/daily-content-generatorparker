import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Star, Loader2, ImageIcon } from 'lucide-react';
import type { UploadedImage } from '@/hooks/useImageUpload';

interface ImageUploaderProps {
  images: UploadedImage[];
  uploads: { fileName: string; progress: number; status: string }[];
  onUpload: (files: File[]) => void;
  onDelete: (imageId: string) => void;
  onSetPrimary: (imageId: string) => void;
  onUpdateAltText: (imageId: string, altText: string) => void;
  disabled?: boolean;
}

const ImageUploader = ({
  images,
  uploads,
  onUpload,
  onDelete,
  onSetPrimary,
  onUpdateAltText,
  disabled,
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onUpload(files);
    },
    [onUpload, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onUpload(files);
      if (inputRef.current) inputRef.current.value = '';
    },
    [onUpload]
  );

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-secondary/30 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Drop images here or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG, WebP · Max 5MB · Up to 10 images
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((u) => (
            <div
              key={u.fileName}
              className="flex items-center gap-3 text-sm p-2 bg-secondary rounded-md"
            >
              {u.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {u.status === 'done' && <ImageIcon className="h-4 w-4 text-green-500" />}
              {u.status === 'error' && <X className="h-4 w-4 text-destructive" />}
              <span className="truncate flex-1">{u.fileName}</span>
              <span className="text-xs text-muted-foreground capitalize">{u.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group border border-border rounded-lg overflow-hidden bg-secondary"
            >
              <div className="aspect-square">
                <img
                  src={img.image_url}
                  alt={img.alt_text || ''}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Primary badge */}
              {img.is_primary && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
                  Primary
                </div>
              )}

              {/* Action overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.is_primary && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onSetPrimary(img.id)}
                    title="Set as primary"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDelete(img.id)}
                  title="Delete"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Alt text */}
              <div className="p-2">
                <Input
                  value={img.alt_text || ''}
                  onChange={(e) => onUpdateAltText(img.id, e.target.value)}
                  placeholder="Alt text"
                  className="h-7 text-xs bg-background"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && uploads.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No images yet. Save the product first, then upload images.
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
