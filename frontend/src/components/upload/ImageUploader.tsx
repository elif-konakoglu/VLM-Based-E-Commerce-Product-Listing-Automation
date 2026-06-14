import { useRef, useState } from "react";
import { Upload, X, Star, Loader2, AlertCircle } from "lucide-react";
import { uploadImage } from "@/api/uploads";
import type { ProductImage } from "@/types";

interface ImageUploaderProps {
  images: ProductImage[];
  mainImageId: string | null;
  onImagesChange: (images: ProductImage[]) => void;
  onMainImageChange: (id: string) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function ImageUploader({
  images,
  mainImageId,
  onImagesChange,
  onMainImageChange,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setError(null);
    setUploading(true);

    const newImages: ProductImage[] = [];

    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" exceeds the 10MB size limit.`);
        continue;
      }

      try {
        const uploaded = await uploadImage(file);
        newImages.push(uploaded);
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message || "Upload failed";
        setError(msg);
      }
    }

    if (newImages.length > 0) {
      const updated = [...images, ...newImages];
      onImagesChange(updated);
      if (!mainImageId) {
        onMainImageChange(newImages[0].id);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    onImagesChange(updated);
    if (mainImageId === id) {
      onMainImageChange(updated[0]?.id || "");
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
          uploading
            ? "border-border bg-secondary/50 cursor-wait"
            : dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="text-center">
          {uploading ? (
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          ) : (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
          )}
          <p className="mt-3 text-sm font-medium text-card-foreground">
            {uploading
              ? "Uploading..."
              : dragOver
              ? "Drop images here"
              : "Drop images or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, or WebP up to 10MB</p>
          {!uploading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Browse Files
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                mainImageId === img.id
                  ? "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/30"
              }`}
              onClick={() => onMainImageChange(img.id)}
            >
              <img
                src={img.url}
                alt={img.original_filename}
                className="h-full w-full object-cover"
              />
              {mainImageId === img.id && (
                <div className="absolute left-1.5 top-1.5 rounded-lg bg-primary p-1 shadow-sm">
                  <Star className="h-3 w-3 fill-white text-white" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <Star className="mr-1 inline h-3 w-3" />
          Click an image to set it as the main product image
        </p>
      )}
    </div>
  );
}
