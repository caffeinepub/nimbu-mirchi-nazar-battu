import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import {
  Banknote,
  Calendar,
  CreditCard,
  LogIn,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { type DeliveryAddress, mockBackend } from "../../mocks/backend";
import {
  type OrderType,
  type PaymentMethod,
  useCartStore,
} from "../../stores/cartStore";
import {
  formatDate,
  getNext4Saturdays,
  getNextSaturday,
} from "../../utils/dateUtils";
import { formatPrice } from "../../utils/formatUtils";

const CATEGORY_EMOJIS: Record<string, string> = {
  Home: "🏠",
  Shop: "🏪",
  Car: "🚗",
};

export function CartPage() {
  const {
    items,
    orderType,
    paymentMethod,
    updateQuantity,
    removeItem,
    clearCart,
    setOrderType,
    setPaymentMethod,
    totalAmount,
  } = useCartStore();
  const { identity } = useInternetIdentity();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState<DeliveryAddress>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
  });

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const nextSaturday = getNextSaturday();
  const next4Saturdays = getNext4Saturdays();
  const total = totalAmount();

  // One-time order flow
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: BigInt(item.quantity),
        price: item.product.price,
      }));
      const deliveryDate = BigInt(nextSaturday.getTime());

      const order = await mockBackend.createOrder(
        orderItems,
        total,
        "OneTime",
        deliveryDate,
        address,
      );

      if (paymentMethod === "COD") {
        return { type: "cod" as const };
      }

      const checkoutUrl = await mockBackend.createStripeCheckout(
        order.id,
        total,
        orderItems,
      );
      return { type: "stripe" as const, url: checkoutUrl };
    },
    onSuccess: (result) => {
      if (result.type === "cod") {
        toast.success("Order place ho gaya! Delivery par cash dein.");
        clearCart();
      } else {
        toast.success("Order create ho gaya! Payment page par ja rahe hain...");
        setTimeout(() => {
          window.open(result.url, "_blank");
          clearCart();
        }, 1000);
      }
    },
    onError: () => {
      toast.error("Order create karne mein problem aayi. Phir try karein.");
    },
  });

  // Subscription flow
  const createSubMutation = useMutation({
    mutationFn: async () => {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: BigInt(item.quantity),
        price: item.product.price,
      }));
      const deliveryDates = next4Saturdays.map((d) => BigInt(d.getTime()));
      const subscriptionTotal = total * 4n;

      const sub = await mockBackend.createSubscription(
        orderItems,
        subscriptionTotal,
        deliveryDates,
        address,
      );

      if (paymentMethod === "COD") {
        return { type: "cod" as const };
      }

      const checkoutUrl = await mockBackend.createStripeSubscriptionCheckout(
        sub.id,
        subscriptionTotal,
        orderItems,
      );
      return { type: "stripe" as const, url: checkoutUrl };
    },
    onSuccess: (result) => {
      if (result.type === "cod") {
        toast.success(
          "Subscription place ho gaya! Pehli delivery par cash dein.",
        );
        clearCart();
      } else {
        toast.success(
          "Subscription create ho gaya! Payment page par ja rahe hain...",
        );
        setTimeout(() => {
          window.open(result.url, "_blank");
          clearCart();
        }, 1000);
      }
    },
    onError: () => {
      toast.error(
        "Subscription create karne mein problem aayi. Phir try karein.",
      );
    },
  });

  const handleProceedToAddress = () => {
    if (!isLoggedIn) {
      toast.error("Pehle login karein");
      return;
    }
    if (items.length === 0) {
      toast.error("Cart khaali hai");
      return;
    }
    setShowAddressForm(true);
  };

  const handleCheckout = () => {
    if (!address.name.trim()) {
      toast.error("Naam daalna zaroori hai");
      return;
    }
    if (!address.phone.trim() || address.phone.replace(/\D/g, "").length < 10) {
      toast.error("Sahi phone number daalen (10 digits)");
      return;
    }
    if (!address.addressLine1.trim()) {
      toast.error("Address daalna zaroori hai");
      return;
    }
    if (!address.city.trim()) {
      toast.error("Sheher ka naam daalen");
      return;
    }
    if (
      !address.pincode.trim() ||
      address.pincode.replace(/\D/g, "").length < 6
    ) {
      toast.error("Sahi 6-digit pincode daalen");
      return;
    }
    setIsCheckingOut(true);
    if (orderType === "OneTime") {
      createOrderMutation.mutate();
    } else {
      createSubMutation.mutate();
    }
  };

  const isPending =
    createOrderMutation.isPending || createSubMutation.isPending;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-6xl mb-4 block">🛒</span>
          <h2
            className="font-display text-2xl font-bold mb-2"
            style={{ color: "oklch(0.22 0.04 50)" }}
          >
            Cart Khaali Hai
          </h2>
          <p className="text-sm mb-6" style={{ color: "oklch(0.5 0.04 60)" }}>
            Shop mein jaao aur apni pasand ke products cart mein daalo
          </p>
        </motion.div>
      </div>
    );
  }

  const subscriptionTotal = total * 4n;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1
          className="font-display text-3xl font-bold mb-1"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Aapka Cart
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.5 0.04 60)" }}>
          {items.length} item{items.length > 1 ? "s" : ""} cart mein
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.product.id.toString()}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="border overflow-hidden"
                  style={{ borderColor: "oklch(0.88 0.04 80)" }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      {/* Product Emoji */}
                      <div
                        className="h-16 w-16 rounded-lg flex items-center justify-center shrink-0 text-3xl"
                        style={{ background: "oklch(0.93 0.02 85)" }}
                      >
                        {CATEGORY_EMOJIS[item.product.category] ?? "🧿"}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="font-medium text-sm leading-snug line-clamp-2"
                            style={{ color: "oklch(0.22 0.04 50)" }}
                          >
                            {item.product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="shrink-0 p-1 rounded transition-colors hover:bg-red-50"
                            style={{ color: "oklch(0.55 0.2 25)" }}
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <Badge
                          className="mt-1 text-[10px] border-0 font-medium"
                          style={{
                            background: "oklch(0.93 0.02 85)",
                            color: "oklch(0.5 0.04 60)",
                          }}
                        >
                          {item.product.category}
                        </Badge>
                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div
                            className="flex items-center gap-2 border rounded-md"
                            style={{ borderColor: "oklch(0.88 0.04 80)" }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              className="p-1.5 hover:bg-gray-50 transition-colors rounded-l-md"
                              style={{ color: "oklch(0.35 0.04 50)" }}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span
                              className="px-3 text-sm font-semibold min-w-[2rem] text-center"
                              style={{ color: "oklch(0.22 0.04 50)" }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              className="p-1.5 hover:bg-gray-50 transition-colors rounded-r-md"
                              style={{ color: "oklch(0.35 0.04 50)" }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span
                            className="font-bold text-base"
                            style={{ color: "oklch(0.42 0.15 45)" }}
                          >
                            {formatPrice(
                              item.product.price * BigInt(item.quantity),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Order Type */}
          <Card
            className="border"
            style={{ borderColor: "oklch(0.88 0.04 80)" }}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: "oklch(0.22 0.04 50)" }}
              >
                <ShoppingBag
                  className="h-4 w-4"
                  style={{ color: "oklch(0.62 0.18 45)" }}
                />
                Order Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={orderType}
                onValueChange={(v) => setOrderType(v as OrderType)}
                className="space-y-3"
              >
                <div
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    orderType === "OneTime"
                      ? "border-primary shadow-sm"
                      : "border-border"
                  }`}
                  style={{
                    borderColor:
                      orderType === "OneTime"
                        ? "oklch(0.62 0.18 45)"
                        : "oklch(0.88 0.04 80)",
                    background:
                      orderType === "OneTime"
                        ? "oklch(0.62 0.18 45 / 0.05)"
                        : "transparent",
                  }}
                  onClick={() => setOrderType("OneTime")}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setOrderType("OneTime")
                  }
                >
                  <RadioGroupItem
                    value="OneTime"
                    id="oneTime"
                    className="mt-0.5"
                  />
                  <div>
                    <Label
                      htmlFor="oneTime"
                      className="text-sm font-medium cursor-pointer"
                      style={{ color: "oklch(0.22 0.04 50)" }}
                    >
                      Ek Baar ka Order
                    </Label>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.5 0.04 60)" }}
                    >
                      Single delivery — {formatPrice(total)}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                  style={{
                    borderColor:
                      orderType === "Subscription"
                        ? "oklch(0.35 0.1 155)"
                        : "oklch(0.88 0.04 80)",
                    background:
                      orderType === "Subscription"
                        ? "oklch(0.35 0.1 155 / 0.05)"
                        : "transparent",
                  }}
                  onClick={() => setOrderType("Subscription")}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setOrderType("Subscription")
                  }
                >
                  <RadioGroupItem
                    value="Subscription"
                    id="subscription"
                    className="mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Label
                        htmlFor="subscription"
                        className="text-sm font-medium cursor-pointer"
                        style={{ color: "oklch(0.22 0.04 50)" }}
                      >
                        Monthly Subscription
                      </Label>
                      <Badge
                        className="text-[10px] border-0"
                        style={{
                          background: "oklch(0.35 0.1 155 / 0.15)",
                          color: "oklch(0.35 0.1 155)",
                        }}
                      >
                        Save 10%
                      </Badge>
                    </div>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.5 0.04 60)" }}
                    >
                      4 Saturday deliveries — {formatPrice(subscriptionTotal)}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card
            className="border"
            style={{ borderColor: "oklch(0.88 0.04 80)" }}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: "oklch(0.22 0.04 50)" }}
              >
                <CreditCard
                  className="h-4 w-4"
                  style={{ color: "oklch(0.62 0.18 45)" }}
                />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="space-y-3"
              >
                {/* Stripe */}
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                  style={{
                    borderColor:
                      paymentMethod === "Stripe"
                        ? "oklch(0.62 0.18 45)"
                        : "oklch(0.88 0.04 80)",
                    background:
                      paymentMethod === "Stripe"
                        ? "oklch(0.62 0.18 45 / 0.05)"
                        : "transparent",
                  }}
                  onClick={() => setPaymentMethod("Stripe")}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setPaymentMethod("Stripe")
                  }
                >
                  <RadioGroupItem
                    value="Stripe"
                    id="stripe"
                    className="mt-0.5"
                  />
                  <div>
                    <Label
                      htmlFor="stripe"
                      className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
                      style={{ color: "oklch(0.22 0.04 50)" }}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Online Payment
                      (Stripe)
                    </Label>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.5 0.04 60)" }}
                    >
                      Card, UPI, Net Banking — secure checkout
                    </p>
                  </div>
                </div>

                {/* COD */}
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                  style={{
                    borderColor:
                      paymentMethod === "COD"
                        ? "oklch(0.5 0.15 140)"
                        : "oklch(0.88 0.04 80)",
                    background:
                      paymentMethod === "COD"
                        ? "oklch(0.5 0.15 140 / 0.05)"
                        : "transparent",
                  }}
                  onClick={() => setPaymentMethod("COD")}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setPaymentMethod("COD")
                  }
                >
                  <RadioGroupItem value="COD" id="cod" className="mt-0.5" />
                  <div>
                    <Label
                      htmlFor="cod"
                      className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
                      style={{ color: "oklch(0.22 0.04 50)" }}
                    >
                      <Banknote className="h-3.5 w-3.5" /> Cash on Delivery
                      (COD)
                    </Label>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.5 0.04 60)" }}
                    >
                      Delivery ke waqt cash dein
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card
            className="border"
            style={{ borderColor: "oklch(0.88 0.04 80)" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck
                  className="h-4 w-4"
                  style={{ color: "oklch(0.35 0.1 155)" }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.22 0.04 50)" }}
                >
                  Delivery Schedule
                </span>
              </div>
              {orderType === "OneTime" ? (
                <div className="flex items-center gap-2">
                  <Calendar
                    className="h-3.5 w-3.5"
                    style={{ color: "oklch(0.62 0.18 45)" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.35 0.04 50)" }}
                  >
                    {formatDate(nextSaturday)}
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {next4Saturdays.map((date, dateNum) => (
                    <div
                      key={date.toISOString()}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{
                          background: "oklch(0.35 0.1 155 / 0.15)",
                          color: "oklch(0.35 0.1 155)",
                        }}
                      >
                        {dateNum + 1}
                      </div>
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.45 0.04 60)" }}
                      >
                        {formatDate(date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Total */}
          <Card
            className="border"
            style={{ borderColor: "oklch(0.88 0.04 80)" }}
          >
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.product.id.toString()}
                    className="flex justify-between text-xs"
                  >
                    <span style={{ color: "oklch(0.5 0.04 60)" }}>
                      {item.product.name.slice(0, 25)}... × {item.quantity}
                    </span>
                    <span style={{ color: "oklch(0.35 0.04 50)" }}>
                      {formatPrice(item.product.price * BigInt(item.quantity))}
                    </span>
                  </div>
                ))}
                {orderType === "Subscription" && (
                  <div
                    className="flex justify-between text-xs"
                    style={{ color: "oklch(0.5 0.04 60)" }}
                  >
                    <span>× 4 Saturdays</span>
                    <span />
                  </div>
                )}
              </div>
              <Separator style={{ background: "oklch(0.88 0.04 80)" }} />
              <div className="flex justify-between items-center">
                <span
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.22 0.04 50)" }}
                >
                  Total
                </span>
                <span
                  className="font-bold text-xl"
                  style={{ color: "oklch(0.42 0.15 45)" }}
                >
                  {formatPrice(
                    orderType === "Subscription" ? subscriptionTotal : total,
                  )}
                </span>
              </div>
              <p
                className="text-[10px]"
                style={{ color: "oklch(0.6 0.04 60)" }}
              >
                * Delivery charges included. GST applicable.
              </p>
            </CardContent>
          </Card>

          {/* Address Form */}
          {showAddressForm && isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="border"
                style={{
                  borderColor: "oklch(0.62 0.18 45)",
                  background: "oklch(0.62 0.18 45 / 0.04)",
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-sm font-semibold flex items-center gap-2"
                    style={{ color: "oklch(0.22 0.04 50)" }}
                  >
                    <MapPin
                      className="h-4 w-4"
                      style={{ color: "oklch(0.62 0.18 45)" }}
                    />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label
                        className="text-xs font-medium"
                        style={{ color: "oklch(0.35 0.04 50)" }}
                      >
                        Aapka Naam *
                      </Label>
                      <Input
                        placeholder="Poora naam"
                        value={address.name}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, name: e.target.value }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        className="text-xs font-medium"
                        style={{ color: "oklch(0.35 0.04 50)" }}
                      >
                        Phone Number *
                      </Label>
                      <Input
                        placeholder="10-digit number"
                        value={address.phone}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, phone: e.target.value }))
                        }
                        className="h-8 text-xs"
                        maxLength={10}
                        type="tel"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.35 0.04 50)" }}
                    >
                      Ghar/Dukaan ka Address *
                    </Label>
                    <Input
                      placeholder="Gali, Mohalla, Flat no."
                      value={address.addressLine1}
                      onChange={(e) =>
                        setAddress((a) => ({
                          ...a,
                          addressLine1: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.5 0.04 60)" }}
                    >
                      Address Line 2 (Optional)
                    </Label>
                    <Input
                      placeholder="Landmark, Colony name"
                      value={address.addressLine2}
                      onChange={(e) =>
                        setAddress((a) => ({
                          ...a,
                          addressLine2: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label
                        className="text-xs font-medium"
                        style={{ color: "oklch(0.35 0.04 50)" }}
                      >
                        Sheher *
                      </Label>
                      <Input
                        placeholder="Delhi, Mumbai..."
                        value={address.city}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, city: e.target.value }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        className="text-xs font-medium"
                        style={{ color: "oklch(0.35 0.04 50)" }}
                      >
                        Pincode *
                      </Label>
                      <Input
                        placeholder="6-digit pincode"
                        value={address.pincode}
                        onChange={(e) =>
                          setAddress((a) => ({ ...a, pincode: e.target.value }))
                        }
                        className="h-8 text-xs"
                        maxLength={6}
                        type="number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Checkout Button */}
          {!isLoggedIn ? (
            <div
              className="p-4 rounded-lg text-center border border-dashed"
              style={{
                borderColor: "oklch(0.62 0.18 45)",
                background: "oklch(0.62 0.18 45 / 0.05)",
              }}
            >
              <LogIn
                className="h-6 w-6 mx-auto mb-2"
                style={{ color: "oklch(0.62 0.18 45)" }}
              />
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "oklch(0.35 0.04 50)" }}
              >
                Checkout ke liye login karein
              </p>
              <p className="text-xs" style={{ color: "oklch(0.5 0.04 60)" }}>
                Internet Identity se secure login karein
              </p>
            </div>
          ) : !showAddressForm ? (
            <Button
              className="w-full gap-2 font-semibold"
              size="lg"
              onClick={handleProceedToAddress}
              style={{
                background: "oklch(0.62 0.18 45)",
                color: "white",
                border: "none",
              }}
            >
              <MapPin className="h-5 w-5" />
              Delivery Address Daalen
            </Button>
          ) : (
            <Button
              className="w-full gap-2 font-semibold"
              size="lg"
              onClick={handleCheckout}
              disabled={isPending || isCheckingOut}
              style={{
                background: "oklch(0.62 0.18 45)",
                color: "white",
                border: "none",
              }}
            >
              <CreditCard className="h-5 w-5" />
              {isPending
                ? "Processing..."
                : `Pay ${formatPrice(orderType === "Subscription" ? subscriptionTotal : total)}`}
            </Button>
          )}

          <p
            className="text-[10px] text-center"
            style={{ color: "oklch(0.6 0.04 60)" }}
          >
            🔒 Stripe dwara secure payment. Card details hamare paas nahi rehti.
          </p>
        </div>
      </div>
    </div>
  );
}
