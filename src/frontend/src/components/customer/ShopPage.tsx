import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Filter, ShoppingCart } from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { mockBackend } from "../../mocks/backend";
import { useCartStore } from "../../stores/cartStore";
import { formatPrice } from "../../utils/formatUtils";

type Category = "All" | "Home" | "Shop" | "Car";

const CATEGORY_EMOJIS: Record<string, string> = {
  Home: "🏠",
  Shop: "🏪",
  Car: "🚗",
};

const CATEGORY_BG: Record<string, string> = {
  Home: "oklch(0.35 0.1 155 / 0.12)",
  Shop: "oklch(0.62 0.18 45 / 0.12)",
  Car: "oklch(0.5 0.15 260 / 0.12)",
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const addItem = useCartStore((s) => s.addItem);

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => mockBackend.getProducts(),
  });

  const filteredProducts =
    allProducts?.filter((p) =>
      selectedCategory === "All" ? true : p.category === selectedCategory,
    ) ?? [];

  const handleAddToCart = (product: NonNullable<typeof allProducts>[0]) => {
    addItem(product);
    toast.success("Cart mein add ho gaya!", {
      description: `${product.name.slice(0, 40)}...`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Filter
            className="h-4 w-4"
            style={{ color: "oklch(0.62 0.18 45)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "oklch(0.62 0.18 45)" }}
          >
            All Products
          </span>
        </div>
        <h1
          className="font-display text-3xl md:text-4xl font-bold mb-2"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Nazar Suraksha Shop
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.5 0.04 60)" }}>
          Ghar, Dukaan aur Gaadi ke liye asli nazar kavach
        </p>
      </motion.div>

      {/* Category Filter */}
      <div className="mb-8">
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as Category)}
        >
          <TabsList
            className="h-auto gap-1 p-1 flex-wrap"
            style={{ background: "oklch(0.93 0.02 85)" }}
          >
            {(["All", "Home", "Shop", "Car"] as Category[]).map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="flex items-center gap-1.5 text-sm data-[state=active]:shadow-sm"
                style={{
                  fontFamily: "inherit",
                }}
              >
                {cat !== "All" && <span>{CATEGORY_EMOJIS[cat]}</span>}
                {cat === "All"
                  ? "Sab Products"
                  : cat === "Home"
                    ? "Ghar"
                    : cat === "Shop"
                      ? "Dukaan"
                      : "Gaadi"}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs mb-4" style={{ color: "oklch(0.5 0.04 60)" }}>
          {filteredProducts.length} products mil gaye
        </p>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {["a", "b", "c", "d", "e", "f"].map((sk) => (
            <div
              key={sk}
              className="rounded-lg overflow-hidden border"
              style={{ borderColor: "oklch(0.88 0.04 80)" }}
            >
              <Skeleton className="h-52" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🧿</span>
          <p
            className="font-display text-lg font-semibold mb-2"
            style={{ color: "oklch(0.35 0.04 50)" }}
          >
            Koi product nahi mila
          </p>
          <p className="text-sm" style={{ color: "oklch(0.5 0.04 60)" }}>
            Doosri category try karein
          </p>
        </div>
      ) : (
        <motion.div
          key={selectedCategory}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id.toString()} variants={fadeInUp}>
              <Card
                className="h-full group overflow-hidden card-hover border flex flex-col"
                style={{ borderColor: "oklch(0.88 0.04 80)" }}
              >
                {/* Product Image Area */}
                <div
                  className="h-52 flex items-center justify-center relative shrink-0"
                  style={{
                    background:
                      CATEGORY_BG[product.category] ?? "oklch(0.93 0.02 85)",
                  }}
                >
                  <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-300">
                    {CATEGORY_EMOJIS[product.category] ?? "🧿"}
                  </span>
                  <Badge
                    className="absolute top-3 left-3 text-[11px] border-0 font-medium"
                    style={{
                      background:
                        product.category === "Home"
                          ? "oklch(0.35 0.1 155 / 0.9)"
                          : product.category === "Shop"
                            ? "oklch(0.52 0.18 45 / 0.9)"
                            : "oklch(0.4 0.15 260 / 0.9)",
                      color: "white",
                    }}
                  >
                    {CATEGORY_EMOJIS[product.category]} {product.category}
                  </Badge>
                </div>

                {/* Content */}
                <CardContent className="p-4 flex flex-col flex-1">
                  <h3
                    className="font-semibold text-sm leading-snug mb-2 line-clamp-2 flex-1"
                    style={{ color: "oklch(0.22 0.04 50)" }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="text-xs mb-4 line-clamp-3 flex-1"
                    style={{ color: "oklch(0.5 0.04 60)" }}
                  >
                    {product.description}
                  </p>
                  <div
                    className="flex items-center justify-between mt-auto pt-3 border-t"
                    style={{ borderColor: "oklch(0.88 0.04 80)" }}
                  >
                    <div>
                      <span
                        className="font-bold text-xl"
                        style={{ color: "oklch(0.42 0.15 45)" }}
                      >
                        {formatPrice(product.price)}
                      </span>
                      <p
                        className="text-[10px]"
                        style={{ color: "oklch(0.6 0.04 60)" }}
                      >
                        per delivery
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="gap-1.5 text-xs font-medium"
                      style={{
                        background: "oklch(0.62 0.18 45)",
                        color: "white",
                        border: "none",
                      }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
