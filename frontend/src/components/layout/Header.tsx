import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

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

  let title = pageTitles[location.pathname];
  if (!title && location.pathname.includes("/edit")) {
    title = "Edit Product";
  }
  title = title || "AI Textile Admin";

  return (
    <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>
      <h1 className="text-lg font-semibold text-gray-900 md:text-xl">{title}</h1>
    </header>
  );
}
