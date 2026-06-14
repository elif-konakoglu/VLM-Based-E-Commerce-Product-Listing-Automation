import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2, Eye, Save, Rocket, Sparkles, AlertTriangle, ArrowLeft, RefreshCw, Archive } from "lucide-react";
import ImageUploader from "@/components/upload/ImageUploader";
import ConfidenceBadge from "@/components/ai/ConfidenceBadge";
import ChatPanel from "@/components/ai/ChatPanel";
import ProductPreview from "@/components/preview/ProductPreview";
import { getProduct, updateProduct, publishProduct, draftProduct, archiveProduct } from "@/api/products";
import { analyzeImage, regenerateField } from "@/api/ai";
import { useToast } from "@/components/ui/Toast";
import type { ProductImage, AISuggestions, AISuggestionField } from "@/types";

type FormData = {
  main_category: string;
  target_audience: string;
  subcategory: string;
  tags: string;
  color: string;
  texture: string;
  pattern: string;
  length_type: string;
  fit_type: string;
  style: string;
  material_guess: string;
  short_marketing_title: string;
  marketing_description: string;
  bullet_points: string;
};

const FIELD_LABELS: Record<keyof FormData, string> = {
  main_category: "Main Category",
  target_audience: "Target Audience",
  subcategory: "Subcategory / Product Type",
  tags: "Tags",
  color: "Colors",
  texture: "Texture",
  pattern: "Pattern",
  length_type: "Length Type",
  fit_type: "Fit Type",
  style: "Style",
  material_guess: "Material Estimate",
  short_marketing_title: "Marketing Title",
  marketing_description: "Marketing Description",
  bullet_points: "Bullet Points",
};

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingField, setRegeneratingField] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleRegenerateField = async (fieldKey: keyof FormData) => {
    if (!mainImageId) return;
    setRegeneratingField(fieldKey);
    try {
      const result = await regenerateField(mainImageId, fieldKey);
      const newValue = Array.isArray(result.value)
        ? (fieldKey === "bullet_points" ? result.value.join("\n") : result.value.join(", "))
        : (result.value || "");
      updateField(fieldKey, newValue);
      if (suggestions) {
        setSuggestions({
          ...suggestions,
          [fieldKey]: {
            value: result.value,
            confidence_percentage: result.confidence_percentage,
          },
        });
      }
      addToast("success", `${FIELD_LABELS[fieldKey]} regenerated`);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Regeneration failed";
      addToast("error", msg);
    } finally {
      setRegeneratingField(null);
    }
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      setForm({
        main_category: product.main_category || "",
        target_audience: product.target_audience || "",
        subcategory: product.subcategory || "",
        tags: product.tags?.join(", ") || "",
        color: product.color?.join(", ") || "",
        texture: product.texture || "",
        pattern: product.pattern || "",
        length_type: product.length_type || "",
        fit_type: product.fit_type || "",
        style: product.style || "",
        material_guess: product.material_guess || "",
        short_marketing_title: product.short_marketing_title || "",
        marketing_description: product.marketing_description || "",
        bullet_points: product.bullet_points?.join("\n") || "",
      });
      setMainImageId(product.main_image_id);
      if (product.confidence_snapshot) {
        setSuggestions(product.confidence_snapshot as unknown as AISuggestions);
      }
    }
  }, [product]);

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeImage(mainImageId!),
    onSuccess: (data) => {
      if (data.suggestions) {
        const s = data.suggestions as unknown as AISuggestions;
        setSuggestions(s);
        setForm({
          main_category: fieldValue(s.main_category) || form?.main_category || "",
          target_audience: fieldValue(s.target_audience) || form?.target_audience || "",
          subcategory: fieldValue(s.subcategory) || form?.subcategory || "",
          tags: arrayFieldValue(s.tags) || form?.tags || "",
          color: arrayFieldValue(s.color) || form?.color || "",
          texture: fieldValue(s.texture) || form?.texture || "",
          pattern: fieldValue(s.pattern) || form?.pattern || "",
          length_type: fieldValue(s.length_type) || form?.length_type || "",
          fit_type: fieldValue(s.fit_type) || form?.fit_type || "",
          style: fieldValue(s.style) || form?.style || "",
          material_guess: fieldValue(s.material_guess) || form?.material_guess || "",
          short_marketing_title: fieldValue(s.short_marketing_title) || form?.short_marketing_title || "",
          marketing_description: fieldValue(s.marketing_description) || form?.marketing_description || "",
          bullet_points: arrayFieldValue(s.bullet_points, "\n") || form?.bullet_points || "",
        });
      }
      setError(null);
    },
    onError: (err: { message?: string }) => {
      setError(err.message || "AI analysis failed.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      updateProduct(id!, {
        main_image_id: mainImageId,
        image_ids: images.map((img) => img.id),
        main_category: form?.main_category || null,
        target_audience: form?.target_audience || null,
        subcategory: form?.subcategory || null,
        tags: form?.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        color: form?.color ? form.color.split(",").map((c) => c.trim()).filter(Boolean) : [],
        texture: form?.texture || null,
        pattern: form?.pattern || null,
        length_type: form?.length_type || null,
        fit_type: form?.fit_type || null,
        style: form?.style || null,
        material_guess: form?.material_guess || null,
        short_marketing_title: form?.short_marketing_title || null,
        marketing_description: form?.marketing_description || null,
        bullet_points: form?.bullet_points ? form.bullet_points.split("\n").filter(Boolean) : [],
        confidence_snapshot: suggestions ? (suggestions as unknown as Record<string, AISuggestionField>) : null,
      }),
    onSuccess: () => navigate("/products"),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishProduct(id!),
    onSuccess: () => navigate("/products"),
  });

  const draftMutation = useMutation({
    mutationFn: () => draftProduct(id!),
    onSuccess: () => navigate("/products"),
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveProduct(id!),
    onSuccess: () => {
      addToast("success", "Product archived");
      navigate("/products");
    },
    onError: (err: { message?: string }) => {
      addToast("error", err.message || "Failed to archive product");
    },
  });

  function fieldValue(field: AISuggestionField): string | null {
    if (Array.isArray(field?.value)) return field.value.join(", ");
    return field?.value as string | null;
  }

  function arrayFieldValue(field: AISuggestionField, sep = ", "): string {
    if (Array.isArray(field?.value)) return field.value.join(sep);
    return (field?.value as string) || "";
  }

  function getConfidence(fieldName: keyof FormData): string | null {
    if (!suggestions) return null;
    const field = (suggestions as unknown as Record<string, AISuggestionField>)[fieldName];
    return field?.confidence_percentage || null;
  }

  const updateField = (key: keyof FormData, value: string) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  const mainImage = images.find((img) => img.id === mainImageId);
  const previewImageUrl = mainImage?.url || product?.main_image_url;

  const formDataForPreview = {
    short_marketing_title: form.short_marketing_title,
    main_category: form.main_category,
    subcategory: form.subcategory,
    marketing_description: form.marketing_description,
    bullet_points: form.bullet_points ? form.bullet_points.split("\n").filter(Boolean) : [],
    color: form.color ? form.color.split(",").map((c) => c.trim()).filter(Boolean) : [],
    pattern: form.pattern,
    texture: form.texture,
    material_guess: form.material_guess,
    style: form.style,
    tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/products")} className="rounded-xl p-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Edit Product</h2>
          </div>
          {product && (
            <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${product.status === "published" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"}`}>
              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${product.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {product.status}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPreview(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary disabled:opacity-50 transition-colors">
            <Save className="h-4 w-4" /> Save
          </button>
          {product?.status === "draft" ? (
            <button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 transition-colors">
              <Rocket className="h-4 w-4" /> Publish
            </button>
          ) : (
            <>
              <button onClick={() => draftMutation.mutate()} disabled={draftMutation.isPending} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 transition-colors">
                Move to Draft
              </button>
              <button onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending} className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors">
                <Archive className="h-4 w-4" /> Archive
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Product Images</h3>
            <ImageUploader images={images} mainImageId={mainImageId} onImagesChange={setImages} onMainImageChange={setMainImageId} />
            {product?.main_image_url && images.length === 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Current main image:</p>
                <img src={product.main_image_url} alt="" className="h-32 w-32 object-cover rounded-xl border border-border" />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <button onClick={() => analyzeMutation.mutate()} disabled={!mainImageId || analyzeMutation.isPending} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 transition-all">
              {analyzeMutation.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>) : (<><Sparkles className="h-4 w-4" /> Re-analyze with AI</>)}
            </button>
            {error && (
              <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}
          </div>

          <ChatPanel imageId={mainImageId} productId={id} context={form as unknown as Record<string, unknown>} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-5">Product Details</h3>
          <div className="space-y-4">
            {(Object.keys(FIELD_LABELS) as Array<keyof FormData>).map((fieldKey) => {
              const confidence = getConfidence(fieldKey);
              const isTextarea = fieldKey === "marketing_description" || fieldKey === "bullet_points";
              const isLowConfidence = confidence && parseInt(confidence) < 50;
              const isRegenerating = regeneratingField === fieldKey;
              return (
                <div key={fieldKey}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-card-foreground">{FIELD_LABELS[fieldKey]}</label>
                    <div className="flex items-center gap-2">
                      {confidence && <ConfidenceBadge percentage={confidence} />}
                      {mainImageId && (
                        <button
                          onClick={() => handleRegenerateField(fieldKey)}
                          disabled={isRegenerating}
                          title={`Regenerate ${FIELD_LABELS[fieldKey]}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50 transition-colors"
                        >
                          <RefreshCw className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                  {isTextarea ? (
                    <textarea value={form[fieldKey]} onChange={(e) => updateField(fieldKey, e.target.value)} rows={fieldKey === "bullet_points" ? 4 : 3} className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${isLowConfidence ? "border-amber-400/50 bg-amber-500/5" : "border-border"}`} />
                  ) : (
                    <input type="text" value={form[fieldKey]} onChange={(e) => updateField(fieldKey, e.target.value)} className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${isLowConfidence ? "border-amber-400/50 bg-amber-500/5" : "border-border"}`} />
                  )}
                  {isLowConfidence && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Low confidence — please verify</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showPreview && <ProductPreview data={formDataForPreview} imageUrl={previewImageUrl} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
