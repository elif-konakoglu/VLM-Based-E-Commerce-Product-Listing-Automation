import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2, Eye, Save, Rocket, Sparkles, AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import ImageUploader from "@/components/upload/ImageUploader";
import ConfidenceBadge from "@/components/ai/ConfidenceBadge";
import ChatPanel from "@/components/ai/ChatPanel";
import ProductPreview from "@/components/preview/ProductPreview";
import { getProduct, updateProduct, publishProduct, draftProduct } from "@/api/products";
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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
          <button onClick={() => navigate("/products")} className="rounded-lg p-1 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
          {product && (
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${product.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {product.status}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPreview(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <Save className="h-4 w-4" /> Save
          </button>
          {product?.status === "draft" ? (
            <button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
              <Rocket className="h-4 w-4" /> Publish
            </button>
          ) : (
            <button onClick={() => draftMutation.mutate()} disabled={draftMutation.isPending} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50">
              Move to Draft
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border bg-white p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Product Images</h3>
            <ImageUploader images={images} mainImageId={mainImageId} onImagesChange={setImages} onMainImageChange={setMainImageId} />
            {product?.main_image_url && images.length === 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Current main image:</p>
                <img src={product.main_image_url} alt="" className="h-32 w-32 object-cover rounded-lg border" />
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-white p-5">
            <button onClick={() => analyzeMutation.mutate()} disabled={!mainImageId || analyzeMutation.isPending} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
              {analyzeMutation.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>) : (<><Sparkles className="h-4 w-4" /> Re-analyze with AI</>)}
            </button>
            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          <ChatPanel imageId={mainImageId} productId={id} context={form as unknown as Record<string, unknown>} />
        </div>

        <div className="rounded-lg border bg-white p-5 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Product Details</h3>
          <div className="space-y-4">
            {(Object.keys(FIELD_LABELS) as Array<keyof FormData>).map((fieldKey) => {
              const confidence = getConfidence(fieldKey);
              const isTextarea = fieldKey === "marketing_description" || fieldKey === "bullet_points";
              const isLowConfidence = confidence && parseInt(confidence) < 50;
              const isRegenerating = regeneratingField === fieldKey;
              return (
                <div key={fieldKey}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">{FIELD_LABELS[fieldKey]}</label>
                    <div className="flex items-center gap-2">
                      {confidence && <ConfidenceBadge percentage={confidence} />}
                      {mainImageId && (
                        <button
                          onClick={() => handleRegenerateField(fieldKey)}
                          disabled={isRegenerating}
                          title={`Regenerate ${FIELD_LABELS[fieldKey]}`}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-1.5 py-0.5 text-xs text-gray-500 hover:border-primary hover:text-primary disabled:opacity-50 transition-colors"
                        >
                          <RefreshCw className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                  {isTextarea ? (
                    <textarea value={form[fieldKey]} onChange={(e) => updateField(fieldKey, e.target.value)} rows={fieldKey === "bullet_points" ? 4 : 3} className={`w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${isLowConfidence ? "border-amber-300 bg-amber-50/50" : "border-gray-300"}`} />
                  ) : (
                    <input type="text" value={form[fieldKey]} onChange={(e) => updateField(fieldKey, e.target.value)} className={`w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${isLowConfidence ? "border-amber-300 bg-amber-50/50" : "border-gray-300"}`} />
                  )}
                  {isLowConfidence && <p className="mt-1 text-xs text-amber-600">Low confidence — please verify</p>}
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
