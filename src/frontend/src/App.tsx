import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { LogIn, ShieldAlert, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type React from "react";

import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminLayout } from "./components/admin/AdminLayout";
import { CmsEditor } from "./components/admin/CmsEditor";
import { Dashboard } from "./components/admin/Dashboard";
import { LegalEditor } from "./components/admin/LegalEditor";
import { OrdersManager } from "./components/admin/OrdersManager";
import { ProductsManager } from "./components/admin/ProductsManager";
import { SubscriptionsManager } from "./components/admin/SubscriptionsManager";
import { CartPage } from "./components/customer/CartPage";
import { HomePage } from "./components/customer/HomePage";
import { OrdersPage } from "./components/customer/OrdersPage";
import { ShopPage } from "./components/customer/ShopPage";
import { SubscriptionsPage } from "./components/customer/SubscriptionsPage";

import { mockBackend } from "./mocks/backend";

type View =
  | "home"
  | "shop"
  | "cart"
  | "orders"
  | "subscriptions"
  | "admin"
  | "legal";

type AdminSection =
  | "dashboard"
  | "products"
  | "orders"
  | "subscriptions"
  | "cms"
  | "legal";

// Simple markdown renderer for legal pages
function LegalPageViewer({
  content,
  onBack,
}: { content: string; onBack: () => void }) {
  const lines = content.split("\n");
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4 gap-1.5 text-sm"
      >
        ← Back
      </Button>
      <div
        className="prose prose-sm max-w-none"
        style={{ color: "oklch(0.25 0.04 50)" }}
      >
        {lines.map((line, lineIdx) => {
          const k = `line-${lineIdx}`;
          if (line.startsWith("# ")) {
            return (
              <h1
                key={k}
                className="font-display text-2xl font-bold mb-4"
                style={{ color: "oklch(0.22 0.04 50)" }}
              >
                {line.slice(2)}
              </h1>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2
                key={k}
                className="font-display text-lg font-semibold mt-6 mb-2"
                style={{ color: "oklch(0.28 0.04 50)" }}
              >
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith("- ")) {
            return (
              <li key={k} className="ml-4 text-sm mb-1">
                {line.slice(2)}
              </li>
            );
          }
          if (line.trim() === "") {
            return <br key={k} />;
          }
          return (
            <p key={k} className="text-sm mb-2">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// Admin PIN - change this to your secret PIN
const ADMIN_PIN = "nimbu2025";

// Check if current URL is the secret admin path
function isAdminUrl(): boolean {
  const hash = window.location.hash;
  const search = window.location.search;
  return hash === "#/admin-panel" || search.includes("admin-panel");
}

// Admin PIN Login Screen
function AdminPinScreen({
  onSuccess,
  onBack,
}: { onSuccess: () => void; onBack: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("adminAuth", "true");
      onSuccess();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "oklch(0.16 0.05 155)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ background: "oklch(0.62 0.18 45)" }}
          >
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1
            className="font-display text-2xl font-bold mb-1"
            style={{ color: "oklch(0.92 0.04 85)" }}
          >
            Admin Panel
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.6 0.06 155)" }}>
            Nimbu Mirchi Nazar Battu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Admin Password daalen"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 transition-colors"
              style={{
                background: "oklch(0.22 0.04 155)",
                color: "oklch(0.92 0.04 85)",
                borderColor: error
                  ? "oklch(0.55 0.2 25)"
                  : "oklch(0.3 0.05 155)",
              }}
            />
            {error && (
              <p
                className="text-xs mt-2"
                style={{ color: "oklch(0.65 0.2 25)" }}
              >
                Galat password. Dobara try karein.
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full py-3 font-semibold"
            style={{
              background: "oklch(0.62 0.18 45)",
              color: "white",
              border: "none",
            }}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Admin Panel Kholein
          </Button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 block mx-auto text-xs"
          style={{ color: "oklch(0.55 0.06 155)" }}
        >
          ← Store par wapas jaayein
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(() =>
    isAdminUrl() ? "admin" : "home",
  );
  const [adminSection, setAdminSection] = useState<AdminSection>("dashboard");
  const [legalSlug, setLegalSlug] = useState("terms");
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(
    () => sessionStorage.getItem("adminAuth") === "true",
  );

  // CMS data
  const { data: cmsData } = useQuery({
    queryKey: ["cmsData"],
    queryFn: () => mockBackend.getCmsData(),
  });

  // Keep mock backend in sync
  useEffect(() => {
    mockBackend.setAdminMode(adminAuthenticated);
  }, [adminAuthenticated]);

  const navigate = (view: View, slug?: string) => {
    if (view === "legal" && slug) {
      setLegalSlug(slug);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Legal page content
  const { data: legalContent } = useQuery({
    queryKey: ["legalPage", legalSlug],
    queryFn: async () => {
      const result = await mockBackend.getLegalPage(legalSlug);
      return result[0] ?? "";
    },
    enabled: currentView === "legal",
  });

  const showPopup =
    cmsData?.popupEnabled && cmsData.popupMessage && !popupDismissed;

  // Admin panel renders full screen
  if (currentView === "admin") {
    if (!adminAuthenticated) {
      return (
        <AdminPinScreen
          onSuccess={() => setAdminAuthenticated(true)}
          onBack={() => {
            window.location.hash = "";
            setCurrentView("home");
          }}
        />
      );
    }

    return (
      <>
        <Toaster richColors position="top-right" />
        <AdminLayout
          activeSection={adminSection}
          onSectionChange={setAdminSection}
          onBack={() => {
            window.location.hash = "";
            setCurrentView("home");
          }}
        >
          {adminSection === "dashboard" && <Dashboard />}
          {adminSection === "products" && <ProductsManager />}
          {adminSection === "orders" && <OrdersManager />}
          {adminSection === "subscriptions" && <SubscriptionsManager />}
          {adminSection === "cms" && <CmsEditor />}
          {adminSection === "legal" && <LegalEditor />}
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />

      {/* Popup Announcement */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-[100] py-2 px-4 flex items-center justify-between gap-3"
            style={{ background: "oklch(0.62 0.18 45)", color: "white" }}
          >
            <p className="text-xs md:text-sm font-medium flex-1 text-center">
              {cmsData?.popupMessage}
            </p>
            <button
              type="button"
              onClick={() => setPopupDismissed(true)}
              className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
              aria-label="Close announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex flex-col min-h-screen ${showPopup ? "pt-10" : ""}`}>
        <Header currentView={currentView} onNavigate={navigate} />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === "home" && (
                <HomePage onNavigate={navigate} cmsData={cmsData ?? null} />
              )}
              {currentView === "shop" && <ShopPage />}
              {currentView === "cart" && <CartPage />}
              {currentView === "orders" && <OrdersPage />}
              {currentView === "subscriptions" && <SubscriptionsPage />}
              {currentView === "legal" && (
                <LegalPageViewer
                  content={legalContent ?? "Loading..."}
                  onBack={() => setCurrentView("home")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer onNavigate={navigate} />
      </div>
    </>
  );
}
