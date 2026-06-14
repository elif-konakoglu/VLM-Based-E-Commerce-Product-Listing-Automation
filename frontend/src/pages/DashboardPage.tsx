import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, FileText, CheckCircle, PlusCircle, ArrowRight, Sparkles } from "lucide-react";
import { listProducts } from "@/api/products";

export default function DashboardPage() {
  const { data: allProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts({}),
  });

  const { data: drafts } = useQuery({
    queryKey: ["products", "draft"],
    queryFn: () => listProducts({ status: "draft" }),
  });

  const { data: published } = useQuery({
    queryKey: ["products", "published"],
    queryFn: () => listProducts({ status: "published" }),
  });

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] p-8 text-white shadow-xl shadow-primary/20">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium text-white/80">AI-Powered Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">Welcome to StitchSense</h1>
          <p className="mt-2 max-w-lg text-sm text-white/70">
            Upload product images and let AI generate categories, descriptions, and marketing copy. Review, edit, and publish with confidence.
          </p>
          <Link
            to="/products/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition-all border border-white/20"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Product
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Package}
          label="Total Products"
          value={String(allProducts?.total ?? 0)}
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="Drafts"
          value={String(drafts?.total ?? 0)}
          color="amber"
        />
        <StatCard
          icon={CheckCircle}
          label="Published"
          value={String(published?.total ?? 0)}
          color="emerald"
        />
      </div>

      {/* Recent Products */}
      {allProducts && allProducts.items.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-card-foreground">Recent Products</h2>
            <Link to="/products" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.items.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}/edit`}
                className="group flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {product.main_image_url ? (
                    <img src={product.main_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="m-3 h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                    {product.short_marketing_title || "Untitled"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{product.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {allProducts && allProducts.items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">No products yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first AI-analyzed product.
          </p>
          <Link
            to="/products/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            <PlusCircle className="h-4 w-4" />
            Create First Product
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "blue" | "amber" | "emerald";
}) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 card-hover shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
