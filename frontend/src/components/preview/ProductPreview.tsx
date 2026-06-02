import { X, Eye, Sparkles, CheckCircle2 } from "lucide-react";

interface ProductPreviewProps {
  data: {
    short_marketing_title?: string | null;
    main_category?: string | null;
    subcategory?: string | null;
    marketing_description?: string | null;
    bullet_points?: string[];
    color?: string[];
    pattern?: string | null;
    texture?: string | null;
    material_guess?: string | null;
    style?: string | null;
    tags?: string[];
  };
  imageUrl?: string | null;
  onClose: () => void;
}

export default function ProductPreview({ data, imageUrl, onClose }: ProductPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-amber-50 px-6 py-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">ADMIN PREVIEW — Product page simulation</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-amber-100">
            <X className="h-5 w-5 text-amber-800" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Image */}
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 shadow-sm">
              {imageUrl ? (
                <img src={imageUrl} alt="Product" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-5">
              {data.main_category && (
                <p className="text-sm font-medium text-primary/80">
                  {data.main_category}
                  {data.subcategory && <span className="text-gray-400"> / {data.subcategory}</span>}
                </p>
              )}

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {data.short_marketing_title || "Untitled Product"}
              </h1>

              {data.marketing_description && (
                <p className="text-gray-600 leading-relaxed">{data.marketing_description}</p>
              )}

              {/* Bullet Points - Modern Card UI */}
              {data.bullet_points && data.bullet_points.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-gray-800">Key Features</h3>
                  </div>
                  <div className="space-y-2.5">
                    {data.bullet_points.map((point, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg bg-white p-3 border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                      >
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {data.color && data.color.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.color.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {data.pattern && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Pattern</span>
                    <p className="mt-1 text-sm font-medium text-gray-800">{data.pattern}</p>
                  </div>
                )}
                {data.texture && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Texture</span>
                    <p className="mt-1 text-sm font-medium text-gray-800">{data.texture}</p>
                  </div>
                )}
                {data.material_guess && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Material</span>
                    <p className="mt-1 text-sm font-medium text-gray-800">{data.material_guess}</p>
                  </div>
                )}
                {data.style && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Style</span>
                    <p className="mt-1 text-sm font-medium text-gray-800">{data.style}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {data.tags && data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-primary/5 border border-primary/10 px-2.5 py-1 text-xs font-medium text-primary/80"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
