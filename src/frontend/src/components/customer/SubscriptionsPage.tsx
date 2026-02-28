import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, Clock, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { mockBackend } from "../../mocks/backend";
import {
  bigIntToDate,
  formatDate,
  formatTimestamp,
} from "../../utils/dateUtils";
import { formatPrice } from "../../utils/formatUtils";

const STATUS_CONFIG = {
  Active: {
    label: "Active",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: "oklch(0.45 0.15 155)",
    bg: "oklch(0.45 0.15 155 / 0.12)",
  },
  Cancelled: {
    label: "Cancelled",
    icon: <X className="h-3.5 w-3.5" />,
    color: "oklch(0.55 0.2 25)",
    bg: "oklch(0.55 0.2 25 / 0.12)",
  },
  Completed: {
    label: "Completed",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    color: "oklch(0.45 0.18 260)",
    bg: "oklch(0.45 0.18 260 / 0.12)",
  },
};

export function SubscriptionsPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["mySubscriptions"],
    queryFn: () => mockBackend.getMySubscriptions(),
    enabled: isLoggedIn,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: bigint) => mockBackend.cancelSubscription(id),
    onSuccess: () => {
      toast.success("Subscription cancel ho gayi");
      setCancellingId(null);
      void queryClient.invalidateQueries({ queryKey: ["mySubscriptions"] });
    },
    onError: () => {
      toast.error("Cancel karne mein problem aayi. Phir try karein.");
      setCancellingId(null);
    },
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
          Subscriptions dekhne ke liye pehle login karein
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
          <Calendar
            className="h-5 w-5"
            style={{ color: "oklch(0.35 0.1 155)" }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: "oklch(0.35 0.1 155)" }}
          >
            My Subscriptions
          </span>
        </div>
        <h1
          className="font-display text-3xl font-bold"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Meri Subscriptions
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.5 0.04 60)" }}>
          Har mahine 4 Shanivar ko delivery
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {["a", "b"].map((sk) => (
            <Card
              key={sk}
              className="border"
              style={{ borderColor: "oklch(0.88 0.04 80)" }}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  {["a", "b", "c", "d"].map((innerSk) => (
                    <Skeleton key={innerSk} className="h-8 rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !subscriptions || subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📅</span>
          <p
            className="font-display text-lg font-semibold mb-2"
            style={{ color: "oklch(0.35 0.04 50)" }}
          >
            Koi subscription nahi mili
          </p>
          <p className="text-sm" style={{ color: "oklch(0.5 0.04 60)" }}>
            Cart mein products daalo aur "Monthly Subscription" choose karein
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
          {subscriptions.map((sub) => {
            const statusCfg =
              STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] ??
              STATUS_CONFIG.Active;
            const isActive = sub.status === "Active";
            const subTotal = sub.total;

            return (
              <motion.div
                key={sub.id.toString()}
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
                          Subscription #{sub.id.toString()}
                        </CardTitle>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "oklch(0.55 0.04 60)" }}
                        >
                          Started: {formatTimestamp(sub.createdAt)}
                        </p>
                      </div>
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
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    {/* Items */}
                    <div className="space-y-1 mb-4">
                      {sub.items.map((item) => (
                        <div
                          key={item.productId.toString()}
                          className="flex justify-between text-xs"
                        >
                          <span style={{ color: "oklch(0.5 0.04 60)" }}>
                            {item.productName.slice(0, 35)}... ×{" "}
                            {item.quantity.toString()}
                          </span>
                          <span style={{ color: "oklch(0.35 0.04 50)" }}>
                            {formatPrice(item.price * item.quantity)} / delivery
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Dates */}
                    <div className="mb-4">
                      <p
                        className="text-xs font-semibold mb-2 flex items-center gap-1"
                        style={{ color: "oklch(0.35 0.04 50)" }}
                      >
                        <Calendar
                          className="h-3.5 w-3.5"
                          style={{ color: "oklch(0.35 0.1 155)" }}
                        />
                        Delivery Dates (4 Saturdays)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {sub.deliveryDates.map((dateTs) => {
                          const date = bigIntToDate(dateTs);
                          const isUpcoming = date > new Date();
                          return (
                            <div
                              key={dateTs.toString()}
                              className="flex items-center gap-1.5 p-2 rounded-lg text-xs"
                              style={{
                                background: isUpcoming
                                  ? "oklch(0.35 0.1 155 / 0.08)"
                                  : "oklch(0.93 0.02 85)",
                                color: isUpcoming
                                  ? "oklch(0.35 0.1 155)"
                                  : "oklch(0.55 0.04 60)",
                              }}
                            >
                              {isUpcoming ? (
                                <Clock className="h-3 w-3 shrink-0" />
                              ) : (
                                <CheckCircle className="h-3 w-3 shrink-0" />
                              )}
                              <span>{formatDate(date)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Total & Cancel */}
                    <div
                      className="flex items-center justify-between pt-3 border-t"
                      style={{ borderColor: "oklch(0.88 0.04 80)" }}
                    >
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.5 0.04 60)" }}
                        >
                          Total (4 deliveries)
                        </p>
                        <p
                          className="font-bold text-xl"
                          style={{ color: "oklch(0.42 0.15 45)" }}
                        >
                          {formatPrice(subTotal)}
                        </p>
                      </div>

                      {isActive && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs"
                              style={{
                                borderColor: "oklch(0.55 0.2 25)",
                                color: "oklch(0.55 0.2 25)",
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Subscription Cancel Karein?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Agle delivery se yeh subscription band ho
                                jaayegi. Pehle ki deliveries ka refund nahi
                                hoga. Kya aap sure hain?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Nahi, Raho</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  setCancellingId(sub.id);
                                  cancelMutation.mutate(sub.id);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {cancelMutation.isPending &&
                                cancellingId === sub.id
                                  ? "Cancelling..."
                                  : "Haan, Cancel Karein"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
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
