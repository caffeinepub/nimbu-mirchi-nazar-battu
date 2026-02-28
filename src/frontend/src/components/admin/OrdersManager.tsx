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
import { CheckCircle, Loader2, Truck, XCircle } from "lucide-react";
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
                  return (
                    <TableRow
                      key={order.id.toString()}
                      style={{ borderColor: "oklch(0.88 0.04 80)" }}
                    >
                      <TableCell className="text-xs font-mono font-semibold">
                        #{order.id.toString()}
                      </TableCell>
                      <TableCell
                        className="text-xs font-mono text-xs"
                        style={{ color: "oklch(0.5 0.04 60)" }}
                      >
                        {shortenPrincipal(order.customerId)}
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
                      <TableCell>
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
                          {(order.status === "Delivered" ||
                            order.status === "Cancelled") && (
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
