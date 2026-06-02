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
      {/* Upload zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          uploading
            ? "border-gray-200 bg-gray-50 cursor-wait"
            : dragOver
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"
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
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
          )}
          <p className="mt-2 text-sm text-gray-600">
            {uploading
              ? "Uploading..."
              : dragOver
              ? "Drop images here"
              : "Drop images here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-gray-400">JPEG, PNG, or WebP up to 10MB</p>
          {!uploading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Browse Files
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                mainImageId === img.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onMainImageChange(img.id)}
            >
              <img
                src={img.url}
                alt={img.original_filename}
                className="h-full w-full object-cover"
              />
              {mainImageId === img.id && (
                <div className="absolute left-1 top-1 rounded-full bg-primary p-1">
                  <Star className="h-3 w-3 fill-white text-white" />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          <Star className="mr-1 inline h-3 w-3" />
          Click an image to set it as the main product image
        </p>
      )}
    </div>
  );
}
