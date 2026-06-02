import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, FileText, CheckCircle, PlusCircle } from "lucide-react";
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Package}
          label="Total Products"
          value={String(allProducts?.total ?? 0)}
        />
        <StatCard
          icon={FileText}
          label="Drafts"
          value={String(drafts?.total ?? 0)}
        />
        <StatCard
          icon={CheckCircle}
          label="Published"
          value={String(published?.total ?? 0)}
        />
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <p className="mt-2 text-sm text-gray-600">
          Upload a product image and let AI generate suggestions for categorization,
          descriptions, and marketing copy.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            to="/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            New Product
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Package className="h-4 w-4" />
            View All Products
          </Link>
        </div>
      </div>

      {allProducts && allProducts.items.length > 0 && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Products</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.items.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}/edit`}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {product.main_image_url ? (
                    <img src={product.main_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="m-3 h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.short_marketing_title || "Untitled"}
                  </p>
                  <p className="text-xs text-gray-500">{product.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
