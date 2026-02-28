import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { mockBackend } from "../../mocks/backend";
import { formatTimestamp } from "../../utils/dateUtils";
import { formatPrice } from "../../utils/formatUtils";

const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "oklch(0.75 0.15 75)",
    bg: "oklch(0.75 0.15 75 / 0.12)",
  },
  Confirmed: {
    label: "Confirmed",
    icon: <Package className="h-3.5 w-3.5" />,
    color: "oklch(0.45 0.18 260)",
    bg: "oklch(0.45 0.18 260 / 0.12)",
  },
  Delivered: {
    label: "Delivered",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: "oklch(0.45 0.15 155)",
    bg: "oklch(0.45 0.15 155 / 0.12)",
  },
  Cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: "oklch(0.55 0.2 25)",
    bg: "oklch(0.55 0.2 25 / 0.12)",
  },
};

const STATUS_STEPS = ["Pending", "Confirmed", "Delivered"];

function StatusStepper({ status }: { status: string }) {
  if (status === "Cancelled") return null;
  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0 mt-3">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                  isCompleted
                    ? "text-white border-transparent"
                    : "text-gray-400 border-gray-200"
                } ${isCurrent ? "ring-2 ring-offset-1" : ""}`}
                style={{
                  background: isCompleted ? "oklch(0.62 0.18 45)" : "white",
                  borderColor: isCompleted
                    ? "oklch(0.62 0.18 45)"
                    : "oklch(0.82 0.04 80)",
                  outline: isCurrent
                    ? "2px solid oklch(0.62 0.18 45 / 0.4)"
                    : undefined,
                  outlineOffset: isCurrent ? "2px" : undefined,
                }}
              >
                {isCompleted ? "✓" : i + 1}
              </div>
              <span
                className="text-[9px] mt-1 font-medium whitespace-nowrap"
                style={{
                  color: isCompleted
                    ? "oklch(0.42 0.15 45)"
                    : "oklch(0.6 0.04 60)",
                }}
              >
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mb-4 mx-1"
                style={{
                  background:
                    i < currentStep
                      ? "oklch(0.62 0.18 45)"
                      : "oklch(0.88 0.04 80)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrdersPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: () => mockBackend.getMyOrders(),
    enabled: isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <span className="text-5xl block mb-4">🔒</span>
        <h2
          className="font-display text-2xl font-bold mb-2"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Login Required
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.5 0.04 60)" }}>
          Orders dekhne ke liye pehle login karein
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Package
            className="h-5 w-5"
            style={{ color: "oklch(0.62 0.18 45)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "oklch(0.62 0.18 45)" }}
          >
            Order History
          </span>
        </div>
        <h1
          className="font-display text-3xl font-bold"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Mere Orders
        </h1>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {["a", "b", "c"].map((sk) => (
            <Card
              key={sk}
              className="border"
              style={{ borderColor: "oklch(0.88 0.04 80)" }}
            >
              <CardContent className="p-5">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-3 w-48 mb-2" />
                <Skeleton className="h-3 w-full mb-3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📦</span>
          <p
            className="font-display text-lg font-semibold mb-2"
            style={{ color: "oklch(0.35 0.04 50)" }}
          >
            Koi order nahi mila
          </p>
          <p className="text-sm" style={{ color: "oklch(0.5 0.04 60)" }}>
            Shop se pehla order karein!
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="space-y-4"
        >
          {orders.map((order) => {
            const statusCfg =
              STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ??
              STATUS_CONFIG.Pending;
            return (
              <motion.div
                key={order.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <Card
                  className="border overflow-hidden"
                  style={{ borderColor: "oklch(0.88 0.04 80)" }}
                >
                  <CardHeader className="pb-3 pt-4 px-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <CardTitle
                          className="text-sm font-semibold"
                          style={{ color: "oklch(0.35 0.04 50)" }}
                        >
                          Order #{order.id.toString()}
                        </CardTitle>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "oklch(0.55 0.04 60)" }}
                        >
                          {formatTimestamp(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className="flex items-center gap-1 text-[11px] border-0 font-medium"
                          style={{
                            background: statusCfg.bg,
                            color: statusCfg.color,
                          }}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </Badge>
                        <Badge
                          className="text-[10px] border-0"
                          style={{
                            background: "oklch(0.93 0.02 85)",
                            color: "oklch(0.5 0.04 60)",
                          }}
                        >
                          {order.orderType === "Subscription"
                            ? "📅 Subscription"
                            : "🛍️ One-time"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    {/* Items */}
                    <div className="space-y-1.5 mb-3">
                      {order.items.map((item) => (
                        <div
                          key={item.productId.toString()}
                          className="flex justify-between text-xs"
                        >
                          <span style={{ color: "oklch(0.5 0.04 60)" }}>
                            {item.productName.slice(0, 35)}... ×{" "}
                            {item.quantity.toString()}
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: "oklch(0.35 0.04 50)" }}
                          >
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="flex items-center justify-between py-2 border-t border-b"
                      style={{ borderColor: "oklch(0.88 0.04 80)" }}
                    >
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: "oklch(0.5 0.04 60)" }}
                      >
                        <Truck className="h-3.5 w-3.5" />
                        Delivery: {formatTimestamp(order.deliveryDate)}
                      </div>
                      <span
                        className="font-bold text-base"
                        style={{ color: "oklch(0.42 0.15 45)" }}
                      >
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    {/* Progress stepper */}
                    <StatusStepper status={order.status} />

                    {order.status === "Cancelled" && (
                      <div
                        className="mt-3 p-2 rounded-lg text-xs text-center"
                        style={{
                          background: "oklch(0.55 0.2 25 / 0.08)",
                          color: "oklch(0.45 0.18 25)",
                        }}
                      >
                        ❌ Yeh order cancel ho gaya hai
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
