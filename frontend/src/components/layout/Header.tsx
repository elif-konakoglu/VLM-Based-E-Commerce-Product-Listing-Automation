import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useState, useRef, useEffect } from "react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/products/new": "New Product",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  let title = pageTitles[location.pathname];
  if (!title && location.pathname.includes("/edit")) {
    title = "Edit Product";
  }
  title = title || "StitchSense";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 hover:bg-secondary lg:hidden transition-colors"
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold text-card-foreground md:text-xl">{title}</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors"
          title="Change theme"
        >
          <ThemeIcon className="h-4 w-4 text-muted-foreground" />
        </button>

        {showThemeMenu && (
          <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/10 animate-fade-in z-50">
            {[
              { value: "light" as const, icon: Sun, label: "Light" },
              { value: "dark" as const, icon: Moon, label: "Dark" },
              { value: "system" as const, icon: Monitor, label: "System" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => { setTheme(item.value); setShowThemeMenu(false); }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  theme === item.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
