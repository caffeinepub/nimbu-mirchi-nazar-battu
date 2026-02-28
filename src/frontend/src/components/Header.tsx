import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  LogIn,
  LogOut,
  Menu,
  Package,
  Shield,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCartStore } from "../stores/cartStore";
import { shortenPrincipal } from "../utils/formatUtils";

type View =
  | "home"
  | "shop"
  | "cart"
  | "orders"
  | "subscriptions"
  | "admin"
  | "legal";

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = isLoggedIn ? identity.getPrincipal().toString() : null;

  const navItems = [
    { view: "home" as View, label: "Home" },
    { view: "shop" as View, label: "Shop" },
    { view: "orders" as View, label: "My Orders", requireAuth: true },
    {
      view: "subscriptions" as View,
      label: "Subscriptions",
      requireAuth: true,
    },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/60 shadow-sm"
      style={{ background: "oklch(0.16 0.05 155)" }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 shrink-0 group"
        >
          <span className="text-2xl select-none">🍋</span>
          <div className="flex flex-col leading-tight">
            <span
              className="font-display font-bold text-sm leading-none"
              style={{ color: "oklch(0.78 0.18 75)" }}
            >
              Nimbu Mirchi
            </span>
            <span
              className="font-body text-xs leading-none"
              style={{ color: "oklch(0.75 0.12 155)" }}
            >
              Nazar Battu
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(
            (item) =>
              (!item.requireAuth || isLoggedIn) && (
                <button
                  type="button"
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.view
                      ? "text-white"
                      : "hover:text-white"
                  }`}
                  style={{
                    color:
                      currentView === item.view
                        ? "oklch(0.78 0.18 75)"
                        : "oklch(0.75 0.1 155)",
                    background:
                      currentView === item.view
                        ? "oklch(0.22 0.06 155)"
                        : "transparent",
                  }}
                >
                  {item.label}
                </button>
              ),
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart Button */}
          <button
            type="button"
            onClick={() => onNavigate("cart")}
            className={`relative p-2 rounded-md transition-colors ${
              currentView === "cart" ? "text-white" : ""
            }`}
            style={{
              color:
                currentView === "cart"
                  ? "oklch(0.78 0.18 75)"
                  : "oklch(0.75 0.1 155)",
            }}
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold rounded-full border-0"
                style={{ background: "oklch(0.62 0.18 45)", color: "white" }}
              >
                {totalItems}
              </Badge>
            )}
          </button>

          {/* Auth */}
          {isInitializing ? (
            <div
              className="h-9 w-24 rounded-md animate-pulse"
              style={{ background: "oklch(0.22 0.06 155)" }}
            />
          ) : isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs"
                style={{
                  background: "oklch(0.22 0.06 155)",
                  color: "oklch(0.75 0.1 155)",
                }}
              >
                <User className="h-3.5 w-3.5" />
                <span className="font-mono">
                  {principal ? shortenPrincipal(principal) : "User"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-xs gap-1.5 transition-colors"
                style={{ color: "oklch(0.65 0.08 30)" }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="hidden md:flex gap-1.5 text-sm font-medium"
              style={{
                background: "oklch(0.62 0.18 45)",
                color: "white",
                border: "none",
              }}
            >
              <LogIn className="h-4 w-4" />
              {isLoggingIn ? "Connecting..." : "Login"}
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md"
            style={{ color: "oklch(0.75 0.1 155)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-border/20 px-4 py-3 space-y-1 animate-fade-in"
          style={{ background: "oklch(0.14 0.05 155)" }}
        >
          {navItems.map(
            (item) =>
              (!item.requireAuth || isLoggedIn) && (
                <button
                  type="button"
                  key={item.view}
                  onClick={() => {
                    onNavigate(item.view);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex items-center gap-2"
                  style={{
                    color:
                      currentView === item.view
                        ? "oklch(0.78 0.18 75)"
                        : "oklch(0.75 0.1 155)",
                    background:
                      currentView === item.view
                        ? "oklch(0.22 0.06 155)"
                        : "transparent",
                  }}
                >
                  {item.view === "home" && "🏠"}
                  {item.view === "shop" && "🛍️"}
                  {item.view === "orders" && <Package className="h-4 w-4" />}
                  {item.view === "subscriptions" && (
                    <Calendar className="h-4 w-4" />
                  )}
                  {item.label}
                </button>
              ),
          )}

          {isLoggedIn ? (
            <>
              <div
                className="px-3 py-2 text-xs rounded-md"
                style={{
                  background: "oklch(0.22 0.06 155)",
                  color: "oklch(0.65 0.08 155)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="font-mono">
                    {principal ? shortenPrincipal(principal) : "User"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-2"
                style={{ color: "oklch(0.65 0.08 30)" }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                login();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-2 font-medium"
              style={{ color: "oklch(0.78 0.18 75)" }}
            >
              <LogIn className="h-4 w-4" />
              Login with Internet Identity
            </button>
          )}
        </div>
      )}
    </header>
  );
}
