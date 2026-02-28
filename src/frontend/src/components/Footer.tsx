import { Heart, Shield } from "lucide-react";

interface FooterProps {
  onNavigate: (view: "legal", slug?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-border/40 mt-auto"
      style={{ background: "oklch(0.16 0.05 155)" }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🍋</span>
              <div>
                <p
                  className="font-display font-bold text-sm"
                  style={{ color: "oklch(0.78 0.18 75)" }}
                >
                  Nimbu Mirchi Nazar Battu
                </p>
                <p className="text-xs" style={{ color: "oklch(0.6 0.08 155)" }}>
                  Asli Nazar Suraksha
                </p>
              </div>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "oklch(0.55 0.06 155)" }}
            >
              Pracheen Indian parampara se prerna lekar, aapke ghar, dukaan aur
              gaadi ko buri nazar se surakshit rakhne ka hamaara sankalp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-semibold text-sm mb-3"
              style={{ color: "oklch(0.75 0.1 155)" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "#" },
                { label: "Shop Products", href: "#" },
                { label: "My Orders", href: "#" },
                { label: "Subscriptions", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-xs transition-colors hover:opacity-80"
                    style={{ color: "oklch(0.55 0.06 155)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="font-semibold text-sm mb-3"
              style={{ color: "oklch(0.75 0.1 155)" }}
            >
              Legal
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Terms & Conditions", slug: "terms" },
                { label: "Privacy Policy", slug: "privacy" },
                { label: "Refund Policy", slug: "refund" },
              ].map((link) => (
                <li key={link.slug}>
                  <button
                    type="button"
                    onClick={() => onNavigate("legal", link.slug)}
                    className="text-xs transition-colors hover:opacity-80 text-left"
                    style={{ color: "oklch(0.55 0.06 155)" }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-1.5">
              <Shield
                className="h-3.5 w-3.5"
                style={{ color: "oklch(0.55 0.1 155)" }}
              />
              <span
                className="text-xs"
                style={{ color: "oklch(0.5 0.06 155)" }}
              >
                Secure payments via Stripe
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/20 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "oklch(0.45 0.05 155)" }}>
            © {year} Nimbu Mirchi Nazar Battu. Sab haq surakshit.
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
            style={{ color: "oklch(0.45 0.05 155)" }}
          >
            Built with{" "}
            <Heart
              className="h-3 w-3 fill-current"
              style={{ color: "oklch(0.62 0.18 45)" }}
            />{" "}
            using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
