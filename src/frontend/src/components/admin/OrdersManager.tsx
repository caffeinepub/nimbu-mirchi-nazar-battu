import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { mockBackend } from "../../mocks/backend";
import { formatTimestamp } from "../../utils/dateUtils";
import { formatPrice, shortenPrincipal } from "../../utils/formatUtils";

type StatusFilter = "All" | "Pending" | "Confirmed" | "Delivered" | "Cancelled";

const STATUS_COLORS = {
  Pending: { color: "oklch(0.55 0.12 75)", bg: "oklch(0.55 0.12 75 / 0.12)" },
  Confirmed: {
    color: "oklch(0.45 0.18 260)",
    bg: "oklch(0.45 0.18 260 / 0.12)",
  },
  Delivered: {
    color: "oklch(0.35 0.12 155)",
    bg: "oklch(0.35 0.12 155 / 0.12)",
  },
  Cancelled: { color: "oklch(0.55 0.2 25)", bg: "oklch(0.55 0.2 25 / 0.12)" },
};

export function OrdersManager() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [processingId, setProcessingId] = useState<bigint | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<bigint | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => mockBackend.getAllOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: bigint; status: string }) =>
      mockBackend.updateOrderStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(`Order ${vars.status} ho gaya!`);
      setProcessingId(null);
      void queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: () => {
      toast.error("Status update karne mein problem aayi.");
      setProcessingId(null);
    },
  });

  const handleStatusUpdate = (id: bigint, status: string) => {
    setProcessingId(id);
    updateStatusMutation.mutate({ id, status });
  };

  const filteredOrders =
    orders?.filter((o) =>
      statusFilter === "All" ? true : o.status === statusFilter,
    ) ?? [];

  const pendingOrders = orders?.filter((o) => o.status === "Pending") ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Orders Management
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.04 60)" }}>
          Sab orders ka management karein
        </p>
      </div>

      {/* Pending orders alert banner */}
      {pendingOrders.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg border"
          style={{
            background: "oklch(0.55 0.22 25 / 0.08)",
            borderColor: "oklch(0.55 0.22 25 / 0.4)",
          }}
        >
          <span className="text-lg animate-bounce">🔔</span>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "oklch(0.45 0.22 25)" }}
            >
              {pendingOrders.length} naya order
              {pendingOrders.length > 1 ? "" : ""} confirm karna baaki hai!
            </p>
            <p className="text-xs" style={{ color: "oklch(0.55 0.1 30)" }}>
              {pendingOrders
                .map(
                  (o) =>
                    `#${o.id.toString()} — ${o.deliveryAddress?.name || "Customer"}`,
                )
                .join("  |  ")}
            </p>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <TabsList
          className="h-auto gap-1 p-1 flex-wrap"
          style={{ background: "oklch(0.93 0.02 85)" }}
        >
          {(
            [
              "All",
              "Pending",
              "Confirmed",
              "Delivered",
              "Cancelled",
            ] as StatusFilter[]
          ).map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs">
              {s === "All" ? "All Orders" : s}
              {s !== "All" && orders && (
                <span
                  className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]"
                  style={{ background: "oklch(0.88 0.04 80)" }}
                >
                  {orders.filter((o) => o.status === s).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c", "d", "e"].map((sk) => (
            <Skeleton key={sk} className="h-12 w-full" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p
            className="font-display text-base font-semibold"
            style={{ color: "oklch(0.35 0.04 50)" }}
          >
            Koi order nahi mila
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: "oklch(0.88 0.04 80)" }}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow
                  style={{
                    background: "oklch(0.96 0.01 85)",
                    borderColor: "oklch(0.88 0.04 80)",
                  }}
                >
                  <TableHead className="text-xs">Order ID</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Items</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const statusCfg =
                    STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] ??
                    STATUS_COLORS.Pending;
                  const isProcessing = processingId === order.id;
                  const isExpanded = expandedOrderId === order.id;
                  const addr = order.deliveryAddress;
                  return (
                    <>
                      <TableRow
                        key={order.id.toString()}
                        style={{
                          borderColor: "oklch(0.88 0.04 80)",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order.id)
                        }
                      >
                        <TableCell className="text-xs font-mono font-semibold">
                          #{order.id.toString()}
                          <span className="ml-1 inline-flex">
                            {isExpanded ? (
                              <ChevronUp
                                className="h-3 w-3 inline"
                                style={{ color: "oklch(0.5 0.04 60)" }}
                              />
                            ) : (
                              <ChevronDown
                                className="h-3 w-3 inline"
                                style={{ color: "oklch(0.5 0.04 60)" }}
                              />
                            )}
                          </span>
                        </TableCell>
                        <TableCell
                          className="text-xs"
                          style={{ color: "oklch(0.35 0.04 50)" }}
                        >
                          {addr?.name || shortenPrincipal(order.customerId)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {addr?.phone ? (
                            <a
                              href={`tel:${addr.phone}`}
                              className="flex items-center gap-1 hover:underline"
                              style={{ color: "oklch(0.45 0.18 260)" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="h-3 w-3" />
                              {addr.phone}
                            </a>
                          ) : (
                            <span style={{ color: "oklch(0.6 0.04 60)" }}>
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatTimestamp(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.items.length}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-[10px] border-0"
                            style={{
                              background: "oklch(0.93 0.02 85)",
                              color: "oklch(0.5 0.04 60)",
                            }}
                          >
                            {order.orderType}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-xs font-semibold"
                          style={{ color: "oklch(0.42 0.15 45)" }}
                        >
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-[10px] border-0"
                            style={{
                              background: statusCfg.bg,
                              color: statusCfg.color,
                            }}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {order.status === "Pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px] gap-1"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "Confirmed")
                                }
                                disabled={isProcessing}
                                style={{
                                  borderColor: "oklch(0.45 0.18 260)",
                                  color: "oklch(0.45 0.18 260)",
                                }}
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                Confirm
                              </Button>
                            )}
                            {order.status === "Confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px] gap-1"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "Delivered")
                                }
                                disabled={isProcessing}
                                style={{
                                  borderColor: "oklch(0.35 0.12 155)",
                                  color: "oklch(0.35 0.12 155)",
                                }}
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Truck className="h-3 w-3" />
                                )}
                                Delivered
                              </Button>
                            )}
                            {(order.status === "Pending" ||
                              order.status === "Confirmed") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[10px] gap-1"
                                onClick={() =>
                                  handleStatusUpdate(order.id, "Cancelled")
                                }
                                disabled={isProcessing}
                                style={{
                                  borderColor: "oklch(0.55 0.2 25)",
                                  color: "oklch(0.55 0.2 25)",
                                }}
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                Cancel
                              </Button>
                            )}
                            {addr?.phone && (
                              <a
                                href={`https://wa.me/91${addr.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                  `Namaste ${addr.name || "Ji"}! Aapka Nimbu Mirchi Nazar Battu ka order #${order.id.toString()} ${order.status === "Confirmed" ? "confirm ho gaya hai. Delivery agle Saturday ko hogi." : order.status === "Delivered" ? "deliver ho gaya hai. Shukriya!" : "receive hua hai. Jald process karenge."}`,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 h-7 px-2 text-[10px] rounded-md border font-medium transition-colors hover:opacity-90"
                                style={{
                                  borderColor: "oklch(0.55 0.18 155)",
                                  color: "oklch(0.35 0.18 155)",
                                  background: "oklch(0.55 0.18 155 / 0.08)",
                                }}
                                onClick={(e) => e.stopPropagation()}
                                data-ocid={`orders.whatsapp_button.${order.id.toString()}`}
                              >
                                <MessageCircle className="h-3 w-3" />
                                WhatsApp
                              </a>
                            )}
                            {(order.status === "Delivered" ||
                              order.status === "Cancelled") &&
                              !addr?.phone && (
                                <span
                                  className="text-[10px]"
                                  style={{ color: "oklch(0.6 0.04 60)" }}
                                >
                                  —
                                </span>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && addr && (
                        <TableRow
                          key={`${order.id.toString()}-addr`}
                          style={{
                            background: "oklch(0.96 0.01 85)",
                            borderColor: "oklch(0.88 0.04 80)",
                          }}
                        >
                          <TableCell colSpan={9} className="py-2 px-4">
                            <div className="flex items-start gap-2">
                              <MapPin
                                className="h-3.5 w-3.5 mt-0.5 shrink-0"
                                style={{ color: "oklch(0.62 0.18 45)" }}
                              />
                              <div>
                                <span
                                  className="text-xs font-semibold"
                                  style={{ color: "oklch(0.35 0.04 50)" }}
                                >
                                  {addr.name}
                                </span>
                                <span
                                  className="text-xs mx-2"
                                  style={{ color: "oklch(0.6 0.04 60)" }}
                                >
                                  |
                                </span>
                                <span
                                  className="text-xs"
                                  style={{ color: "oklch(0.5 0.04 60)" }}
                                >
                                  {addr.addressLine1}
                                  {addr.addressLine2
                                    ? `, ${addr.addressLine2}`
                                    : ""}
                                  , {addr.city} — {addr.pincode}
                                </span>
                                <span
                                  className="text-xs mx-2"
                                  style={{ color: "oklch(0.6 0.04 60)" }}
                                >
                                  |
                                </span>
                                <a
                                  href={`tel:${addr.phone}`}
                                  className="text-xs font-medium hover:underline"
                                  style={{ color: "oklch(0.45 0.18 260)" }}
                                >
                                  📞 {addr.phone}
                                </a>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
