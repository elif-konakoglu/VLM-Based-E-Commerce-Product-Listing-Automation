import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, PlusCircle, X, Sparkles } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/products/new", icon: PlusCircle, label: "New Product" },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">AI Textile</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      <div className="px-4 py-2">
        <div className="h-px bg-white/10" />
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-[hsl(var(--gradient-start))]/20 to-[hsl(var(--gradient-end))]/10 text-white shadow-sm shadow-primary/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-white shadow-md shadow-primary/30"
                    : "bg-white/5 text-gray-400"
                }`}>
                  <item.icon className="h-4 w-4" />
                </div>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-r from-[hsl(var(--gradient-start))]/10 to-[hsl(var(--gradient-end))]/5 border border-white/5 p-4">
          <p className="text-xs font-medium text-gray-300">AI-Powered</p>
          <p className="mt-1 text-[10px] text-gray-500">Vision model analyzes your product images automatically</p>
        </div>
      </div>
    </aside>
  );
}
