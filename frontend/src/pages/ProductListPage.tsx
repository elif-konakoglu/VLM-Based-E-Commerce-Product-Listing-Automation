import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Package, Loader2, Search } from "lucide-react";
import { listProducts } from "@/api/products";
import { useState } from "react";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function ProductListPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["products", statusFilter, search],
    queryFn: () =>
      listProducts({
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Products</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product catalog</p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          <PlusCircle className="h-4 w-4" />
          New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-72 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Updated</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-secondary shadow-sm">
                        {product.main_image_url ? (
                          <img
                            src={product.main_image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="m-2.5 h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-medium text-card-foreground truncate max-w-[200px]">
                        {product.short_marketing_title || "Untitled"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">
                    {product.main_category || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.total > data.limit && (
            <div className="border-t border-border px-5 py-3 text-center text-sm text-muted-foreground bg-secondary/30">
              Showing {data.items.length} of {data.total} products
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            {search
              ? "No products match your search. Try different keywords."
              : "Create your first product to get started with AI-powered onboarding."}
          </p>
          <Link
            to="/products/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
          >
            <PlusCircle className="h-4 w-4" />
            New Product
          </Link>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    archived: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[status] || styles.draft
      }`}
    >
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === "published" ? "bg-emerald-500" : status === "draft" ? "bg-amber-500" : "bg-gray-400"
      }`} />
      {status}
    </span>
  );
}
