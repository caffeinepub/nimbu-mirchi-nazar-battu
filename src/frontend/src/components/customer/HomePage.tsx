import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { toast } from "sonner";
import { mockBackend } from "../../mocks/backend";
import { useCartStore } from "../../stores/cartStore";
import { formatPrice } from "../../utils/formatUtils";

type View =
  | "home"
  | "shop"
  | "cart"
  | "orders"
  | "subscriptions"
  | "admin"
  | "legal";

const CATEGORY_EMOJIS: Record<string, string> = {
  Home: "🏠",
  Shop: "🏪",
  Car: "🚗",
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Home: { bg: "oklch(0.35 0.1 155 / 0.15)", text: "oklch(0.55 0.12 155)" },
  Shop: { bg: "oklch(0.62 0.18 45 / 0.15)", text: "oklch(0.55 0.18 45)" },
  Car: { bg: "oklch(0.5 0.15 260 / 0.15)", text: "oklch(0.45 0.12 260)" },
};

interface HomePageProps {
  onNavigate: (view: View, slug?: string) => void;
  cmsData: {
    bannerTitle: string;
    bannerSubtitle: string;
    tagline: string;
    popupEnabled: boolean;
    popupMessage: string;
  } | null;
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HomePage({ onNavigate, cmsData }: HomePageProps) {
  const addItem = useCartStore((s) => s.addItem);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => mockBackend.getProducts(),
  });

  const featuredProducts = products?.slice(0, 3) ?? [];

  const handleAddToCart = (product: (typeof featuredProducts)[0]) => {
    addItem(product);
    toast.success(`${product.name.slice(0, 30)}... cart mein add hua!`, {
      description: formatPrice(product.price),
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.06 155) 0%, oklch(0.20 0.08 145) 50%, oklch(0.16 0.05 155) 100%)",
        }}
      >
        {/* Background hero image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/generated/hero-nazar-banner.dim_1200x600.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.06 155 / 0.85) 0%, oklch(0.20 0.08 145 / 0.7) 50%, oklch(0.16 0.05 155 / 0.85) 100%)",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-4">
              <Badge
                className="font-body text-xs px-3 py-1 border-0"
                style={{
                  background: "oklch(0.62 0.18 45 / 0.2)",
                  color: "oklch(0.85 0.14 65)",
                }}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Pracheen Indian Parampara
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight"
              style={{ color: "oklch(0.92 0.06 75)" }}
            >
              {cmsData?.bannerTitle ?? "Nimbu Mirchi Nazar Battu"}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl mb-3 font-body"
              style={{ color: "oklch(0.7 0.1 75)" }}
            >
              {cmsData?.bannerSubtitle ??
                "Pracheen Indian parampara se bani nazar suraksha"}
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="text-sm mb-8 max-w-lg mx-auto leading-relaxed"
              style={{ color: "oklch(0.55 0.06 155)" }}
            >
              {cmsData?.tagline ?? "Ghar, Dukaan aur Gaadi ko Nazar se Bachao"}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Button
                size="lg"
                onClick={() => onNavigate("shop")}
                className="gap-2 font-semibold text-sm px-6"
                style={{
                  background: "oklch(0.62 0.18 45)",
                  color: "white",
                  border: "none",
                }}
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("subscriptions")}
                className="gap-2 text-sm px-6"
                style={{
                  borderColor: "oklch(0.35 0.08 155)",
                  color: "oklch(0.72 0.1 155)",
                  background: "transparent",
                }}
              >
                Monthly Subscription
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Strip */}
      <section
        className="py-6 border-y border-border/40"
        style={{ background: "oklch(0.96 0.02 85)" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Truck className="h-5 w-5" />,
                title: "Saturday Delivery",
                desc: "Har Shanivar",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "100% Asli",
                desc: "Natural Products",
              },
              {
                icon: <RefreshCw className="h-5 w-5" />,
                title: "Monthly Pack",
                desc: "4 Saturday Deliveries",
              },
              {
                icon: <Star className="h-5 w-5" />,
                title: "5 ★ Rated",
                desc: "1000+ Happy Customers",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{
                    background: "oklch(0.62 0.18 45 / 0.12)",
                    color: "oklch(0.55 0.18 45)",
                  }}
                >
                  {feature.icon}
                </div>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.25 0.04 50)" }}
                  >
                    {feature.title}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.04 60)" }}
                  >
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="font-display text-2xl md:text-3xl font-bold text-center mb-2"
              style={{ color: "oklch(0.22 0.04 50)" }}
            >
              Shop by Category
            </h2>
            <p
              className="text-center text-sm mb-8"
              style={{ color: "oklch(0.5 0.04 60)" }}
            >
              Apni zarurat ke hisab se choose karein
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                category: "Home",
                title: "Ghar ki Suraksha",
                desc: "Apne ghar ko buri nazar se bachao",
                count: "6 Products",
                img: "/assets/generated/product-home-nazar.dim_600x600.jpg",
              },
              {
                category: "Shop",
                title: "Dukaan ki Barkat",
                desc: "Vyapar mein barkat aur suraksha",
                count: "4 Products",
                img: "/assets/generated/product-shop-nazar.dim_600x600.jpg",
              },
              {
                category: "Car",
                title: "Gaadi ka Kavach",
                desc: "Yaatra surakshit aur shubh karein",
                count: "3 Products",
                img: "/assets/generated/product-car-nazar.dim_600x600.jpg",
              },
            ].map((cat) => (
              <motion.div key={cat.category} variants={fadeInUp}>
                <Card
                  className="cursor-pointer group transition-all duration-200 border overflow-hidden card-hover"
                  onClick={() => onNavigate("shop")}
                  style={{ borderColor: "oklch(0.88 0.04 80)" }}
                >
                  <CardContent className="p-0">
                    <div
                      className="h-40 relative overflow-hidden"
                      style={{
                        background:
                          CATEGORY_COLORS[cat.category]?.bg ??
                          "oklch(0.93 0.02 85)",
                      }}
                    >
                      <img
                        src={cat.img}
                        alt={cat.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                        style={{ background: "oklch(0.1 0.04 50 / 0.3)" }}
                      >
                        <span className="text-4xl select-none drop-shadow-lg">
                          {CATEGORY_EMOJIS[cat.category]}
                        </span>
                        <Badge
                          className="text-xs border-0 shadow-md"
                          style={{
                            background: "oklch(1 0 0 / 0.85)",
                            color: CATEGORY_COLORS[cat.category]?.text,
                          }}
                        >
                          {cat.count}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3
                        className="font-display font-semibold text-base mb-1"
                        style={{ color: "oklch(0.22 0.04 50)" }}
                      >
                        {cat.title}
                      </h3>
                      <p
                        className="text-xs mb-3"
                        style={{ color: "oklch(0.5 0.04 60)" }}
                      >
                        {cat.desc}
                      </p>
                      <div
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: "oklch(0.55 0.18 45)" }}
                      >
                        Shop Now{" "}
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        className="py-12 md:py-16"
        style={{ background: "oklch(0.97 0.015 85)" }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2
                  className="font-display text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: "oklch(0.22 0.04 50)" }}
                >
                  Best Sellers
                </h2>
                <p className="text-sm" style={{ color: "oklch(0.5 0.04 60)" }}>
                  Hamare sabse popular products
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("shop")}
                className="gap-1.5 text-xs hidden md:flex"
                style={{
                  borderColor: "oklch(0.62 0.18 45)",
                  color: "oklch(0.52 0.18 45)",
                }}
              >
                Sab Dekho <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {isLoading
              ? ["a", "b", "c"].map((sk) => (
                  <div key={sk} className="rounded-lg overflow-hidden">
                    <Skeleton className="h-48" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-8 w-1/2" />
                    </div>
                  </div>
                ))
              : featuredProducts.map((product) => (
                  <motion.div key={product.id.toString()} variants={fadeInUp}>
                    <Card
                      className="group overflow-hidden card-hover border"
                      style={{ borderColor: "oklch(0.88 0.04 80)" }}
                    >
                      <div
                        className="h-48 flex items-center justify-center relative"
                        style={{
                          background:
                            CATEGORY_COLORS[product.category]?.bg ??
                            "oklch(0.93 0.02 85)",
                        }}
                      >
                        <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-200">
                          {CATEGORY_EMOJIS[product.category] ?? "🧿"}
                        </span>
                        <Badge
                          className="absolute top-3 right-3 text-xs border-0"
                          style={{
                            background: "white/80",
                            color: CATEGORY_COLORS[product.category]?.text,
                          }}
                        >
                          {product.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3
                          className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2"
                          style={{ color: "oklch(0.22 0.04 50)" }}
                        >
                          {product.name}
                        </h3>
                        <p
                          className="text-xs mb-3 line-clamp-2"
                          style={{ color: "oklch(0.5 0.04 60)" }}
                        >
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className="font-bold text-lg"
                            style={{ color: "oklch(0.42 0.15 45)" }}
                          >
                            {formatPrice(product.price)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="text-xs gap-1.5"
                            style={{
                              background: "oklch(0.62 0.18 45)",
                              color: "white",
                              border: "none",
                            }}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </motion.div>

          <div className="text-center mt-6 md:hidden">
            <Button
              variant="outline"
              onClick={() => onNavigate("shop")}
              className="gap-1.5 text-sm"
              style={{
                borderColor: "oklch(0.62 0.18 45)",
                color: "oklch(0.52 0.18 45)",
              }}
            >
              Sab Products Dekho <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section
        className="py-12 md:py-16"
        style={{ background: "oklch(0.16 0.05 155)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              className="text-2xl mb-2"
              style={{ color: "oklch(0.78 0.18 75)" }}
            >
              🍋 🌶️ 🧿
            </p>
            <h2
              className="font-display text-2xl md:text-3xl font-bold mb-4"
              style={{ color: "oklch(0.9 0.04 85)" }}
            >
              Hazaaron parivaron ka vishwas
            </h2>
            <p
              className="text-sm max-w-lg mx-auto"
              style={{ color: "oklch(0.55 0.06 155)" }}
            >
              Hamari har samagri asli aur suddh hai. Hamare nazar kavach
              pracheen Indian parampara ka hissa hain aur lakhs of families inhe
              upyog karte hain.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
