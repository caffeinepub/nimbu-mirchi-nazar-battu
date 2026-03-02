import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { mockBackend } from "../../mocks/backend";

type AdminSection =
  | "dashboard"
  | "products"
  | "orders"
  | "subscriptions"
  | "cms"
  | "legal";

interface AdminLayoutProps {
  children: ReactNode;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onBack: () => void;
}

const navItems = [
  {
    section: "dashboard" as AdminSection,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  { section: "products" as AdminSection, label: "Products", icon: Package },
  { section: "orders" as AdminSection, label: "Orders", icon: ShoppingCart },
  {
    section: "subscriptions" as AdminSection,
    label: "Subscriptions",
    icon: Calendar,
  },
  { section: "cms" as AdminSection, label: "CMS Editor", icon: FileText },
  { section: "legal" as AdminSection, label: "Legal Pages", icon: BookOpen },
];

export function AdminLayout({
  children,
  activeSection,
  onSectionChange,
  onBack,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: allOrders } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => mockBackend.getAllOrders(),
    refetchInterval: 30000, // poll every 30 seconds
  });

  const pendingCount =
    allOrders?.filter((o) => o.status === "Pending").length ?? 0;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "oklch(0.97 0.01 85)" }}
    >
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "oklch(0.16 0.05 155)" }}
      >
        {/* Sidebar Header */}
        <div
          className="p-5 border-b"
          style={{ borderColor: "oklch(0.22 0.05 155)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🍋</span>
            <div>
              <p
                className="font-display font-bold text-sm leading-none"
                style={{ color: "oklch(0.78 0.18 75)" }}
              >
                Admin Panel
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "oklch(0.55 0.08 155)" }}
              >
                Nimbu Mirchi Nazar Battu
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;
            return (
              <button
                type="button"
                key={item.section}
                onClick={() => {
                  onSectionChange(item.section);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium"
                style={{
                  background: isActive
                    ? "oklch(0.62 0.18 45 / 0.2)"
                    : "transparent",
                  color: isActive
                    ? "oklch(0.78 0.18 75)"
                    : "oklch(0.6 0.07 155)",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {item.section === "orders" && pendingCount > 0 && (
                  <span
                    className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"
                    style={{
                      background: "oklch(0.55 0.22 25)",
                      color: "white",
                    }}
                  >
                    {pendingCount}
                  </span>
                )}
                {isActive && item.section !== "orders" && (
                  <div
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: "oklch(0.78 0.18 75)" }}
                  />
                )}
                {isActive &&
                  item.section === "orders" &&
                  pendingCount === 0 && (
                    <div
                      className="ml-auto h-1.5 w-1.5 rounded-full"
                      style={{ background: "oklch(0.78 0.18 75)" }}
                    />
                  )}
              </button>
            );
          })}
        </nav>

        <Separator style={{ background: "oklch(0.22 0.05 155)" }} />
        <div className="p-3">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
            style={{ color: "oklch(0.55 0.08 155)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Store
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Bar */}
        <header
          className="h-14 flex items-center px-4 border-b gap-3 shrink-0"
          style={{ background: "white", borderColor: "oklch(0.88 0.04 80)" }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>

          <div>
            <p
              className="font-semibold text-sm"
              style={{ color: "oklch(0.22 0.04 50)" }}
            >
              {navItems.find((n) => n.section === activeSection)?.label}
            </p>
          </div>

          <div className="ml-auto">
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-md text-xs"
              style={{
                background: "oklch(0.35 0.1 155 / 0.1)",
                color: "oklch(0.35 0.1 155)",
              }}
            >
              🔐 Admin Mode
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
