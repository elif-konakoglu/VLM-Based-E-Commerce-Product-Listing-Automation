import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2, Eye, Save, Rocket, AlertTriangle, RefreshCw } from "lucide-react";
import ImageUploader from "@/components/upload/ImageUploader";
import ConfidenceBadge from "@/components/ai/ConfidenceBadge";
import ChatPanel from "@/components/ai/ChatPanel";
import ProductPreview from "@/components/preview/ProductPreview";
import { analyzeImage, regenerateField } from "@/api/ai";
import { createProduct } from "@/api/products";
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

const EMPTY_FORM: FormData = {
  main_category: "",
  target_audience: "",
  subcategory: "",
  tags: "",
  color: "",
  texture: "",
  pattern: "",
  length_type: "",
  fit_type: "",
  style: "",
  material_guess: "",
  short_marketing_title: "",
  marketing_description: "",
  bullet_points: "",
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

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingField, setRegeneratingField] = useState<string | null>(null);

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

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeImage(mainImageId!),
    onSuccess: (data) => {
      setAnalysisId(data.id);
      if (data.suggestions) {
        setSuggestions(data.suggestions as unknown as AISuggestions);
        applyAISuggestions(data.suggestions as unknown as AISuggestions);
      }
      setError(null);
    },
    onError: (err: { message?: string }) => {
      setError(err.message || "AI analysis failed. You can retry or fill fields manually.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: (status: "draft" | "published") =>
      createProduct({
        status,
        main_image_id: mainImageId,
        image_ids: images.map((img) => img.id),
        ai_analysis_id: analysisId,
        main_category: form.main_category || null,
        target_audience: form.target_audience || null,
        subcategory: form.subcategory || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        color: form.color ? form.color.split(",").map((c) => c.trim()).filter(Boolean) : [],
        texture: form.texture || null,
        pattern: form.pattern || null,
        length_type: form.length_type || null,
        fit_type: form.fit_type || null,
        style: form.style || null,
        material_guess: form.material_guess || null,
        short_marketing_title: form.short_marketing_title || null,
        marketing_description: form.marketing_description || null,
        bullet_points: form.bullet_points
          ? form.bullet_points.split("\n").filter(Boolean)
          : [],
        confidence_snapshot: suggestions ? buildConfidenceSnapshot(suggestions) : null,
      }),
    onSuccess: () => {
      addToast("success", "Product saved successfully!");
      navigate("/products");
    },
    onError: (err: { message?: string }) => {
      addToast("error", err.message || "Failed to save product");
    },
  });

  function applyAISuggestions(s: AISuggestions) {
    setForm({
      main_category: fieldValue(s.main_category) || "",
      target_audience: fieldValue(s.target_audience) || "",
      subcategory: fieldValue(s.subcategory) || "",
      tags: arrayFieldValue(s.tags),
      color: arrayFieldValue(s.color),
      texture: fieldValue(s.texture) || "",
      pattern: fieldValue(s.pattern) || "",
      length_type: fieldValue(s.length_type) || "",
      fit_type: fieldValue(s.fit_type) || "",
      style: fieldValue(s.style) || "",
      material_guess: fieldValue(s.material_guess) || "",
      short_marketing_title: fieldValue(s.short_marketing_title) || "",
      marketing_description: fieldValue(s.marketing_description) || "",
      bullet_points: arrayFieldValue(s.bullet_points, "\n"),
    });
  }

  function fieldValue(field: AISuggestionField): string | null {
    if (Array.isArray(field?.value)) return field.value.join(", ");
    return field?.value as string | null;
  }

  function arrayFieldValue(field: AISuggestionField, sep = ", "): string {
    if (Array.isArray(field?.value)) return field.value.join(sep);
    return (field?.value as string) || "";
  }

  function buildConfidenceSnapshot(s: AISuggestions): Record<string, AISuggestionField> {
    const snapshot: Record<string, AISuggestionField> = {};
    for (const key of Object.keys(s) as Array<keyof AISuggestions>) {
      snapshot[key] = s[key];
    }
    return snapshot;
  }

  function getConfidence(fieldName: keyof FormData): string | null {
    if (!suggestions) return null;
    const field = suggestions[fieldName as keyof AISuggestions];
    return field?.confidence_percentage || null;
  }

  const updateField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const mainImage = images.find((img) => img.id === mainImageId);

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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Create New Product</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Upload images and let AI fill the details</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary transition-colors"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            onClick={() => saveMutation.mutate("draft")}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" /> Save Draft
          </button>
          <button
            onClick={() => saveMutation.mutate("published")}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 transition-colors"
          >
            <Rocket className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column - Images & AI */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Product Images</h3>
            <ImageUploader
              images={images}
              mainImageId={mainImageId}
              onImagesChange={setImages}
              onMainImageChange={setMainImageId}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <button
              onClick={() => analyzeMutation.mutate()}
              disabled={!mainImageId || analyzeMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 transition-all"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Analyze with AI
                </>
              )}
            </button>
            {!mainImageId && (
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Upload and select a main image first
              </p>
            )}
            {error && (
              <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm text-destructive">{error}</p>
                    <button
                      onClick={() => analyzeMutation.mutate()}
                      className="mt-1 text-xs font-medium text-destructive hover:underline"
                    >
                      Retry analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
            {suggestions && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 text-center font-medium">
                AI suggestions applied. Review and edit below.
              </p>
            )}
          </div>

          <ChatPanel
            imageId={mainImageId}
            context={form as unknown as Record<string, unknown>}
          />
        </div>

        {/* Right column - Form */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-card-foreground">Product Details</h3>
            {suggestions && (
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">AI suggestions applied</span>
            )}
          </div>

          <div className="space-y-4">
            {(Object.keys(FIELD_LABELS) as Array<keyof FormData>).map((fieldKey) => {
              const confidence = getConfidence(fieldKey);
              const isTextarea =
                fieldKey === "marketing_description" || fieldKey === "bullet_points";
              const isLowConfidence =
                confidence && parseInt(confidence) < 50;
              const isRegenerating = regeneratingField === fieldKey;

              return (
                <div key={fieldKey}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-card-foreground">
                      {FIELD_LABELS[fieldKey]}
                    </label>
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
                    <textarea
                      value={form[fieldKey]}
                      onChange={(e) => updateField(fieldKey, e.target.value)}
                      rows={fieldKey === "bullet_points" ? 4 : 3}
                      placeholder={
                        fieldKey === "bullet_points"
                          ? "One bullet point per line"
                          : `Enter ${FIELD_LABELS[fieldKey].toLowerCase()}...`
                      }
                      className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        isLowConfidence ? "border-amber-400/50 bg-amber-500/5" : "border-border"
                      }`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form[fieldKey]}
                      onChange={(e) => updateField(fieldKey, e.target.value)}
                      placeholder={`Enter ${FIELD_LABELS[fieldKey].toLowerCase()}...`}
                      className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        isLowConfidence ? "border-amber-400/50 bg-amber-500/5" : "border-border"
                      }`}
                    />
                  )}
                  {isLowConfidence && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Low confidence — please verify this suggestion
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <ProductPreview
          data={formDataForPreview}
          imageUrl={mainImage?.url}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
