import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Calendar, IndianRupee, Package, TrendingUp } from "lucide-react";
import { mockBackend } from "../../mocks/backend";
import { formatTimestamp } from "../../utils/dateUtils";
import { formatPrice } from "../../utils/formatUtils";

const STATUS_COLORS = {
  Pending: { color: "oklch(0.55 0.12 75)", bg: "oklch(0.55 0.12 75 / 0.12)" },
  Confirmed: {
    color: "oklch(0.45 0.18 260)",
    bg: "oklch(0.45 0.18 260 / 0.12)",
  },
  Delivered: {
    color: "oklch(0.45 0.15 155)",
    bg: "oklch(0.45 0.15 155 / 0.12)",
  },
  Cancelled: { color: "oklch(0.55 0.2 25)", bg: "oklch(0.55 0.2 25 / 0.12)" },
};

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => mockBackend.getDashboardStats(),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => mockBackend.getAllOrders(),
  });

  const recentOrders = orders?.slice(0, 5) ?? [];

  const statCards = [
    {
      title: "Total Orders",
      value: statsLoading ? null : (stats?.totalOrders.toString() ?? "0"),
      icon: <Package className="h-5 w-5" />,
      color: "oklch(0.62 0.18 45)",
      bg: "oklch(0.62 0.18 45 / 0.1)",
    },
    {
      title: "Active Subscriptions",
      value: statsLoading
        ? null
        : (stats?.activeSubscriptions.toString() ?? "0"),
      icon: <Calendar className="h-5 w-5" />,
      color: "oklch(0.35 0.1 155)",
      bg: "oklch(0.35 0.1 155 / 0.1)",
    },
    {
      title: "Total Revenue",
      value: statsLoading ? null : formatPrice(stats?.totalRevenue ?? 0n),
      icon: <IndianRupee className="h-5 w-5" />,
      color: "oklch(0.45 0.15 155)",
      bg: "oklch(0.45 0.15 155 / 0.1)",
    },
    {
      title: "Growth",
      value: "+12%",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "oklch(0.45 0.18 260)",
      bg: "oklch(0.45 0.18 260 / 0.1)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="font-display text-2xl font-bold"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.5 0.04 60)" }}>
          Aaj ki summary
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="border"
            style={{ borderColor: "oklch(0.88 0.04 80)" }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-xs font-medium"
                  style={{ color: "oklch(0.5 0.04 60)" }}
                >
                  {card.title}
                </p>
                <div
                  className="p-2 rounded-lg"
                  style={{ background: card.bg, color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
              {statsLoading && card.value === null ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p
                  className="font-display font-bold text-2xl"
                  style={{ color: "oklch(0.22 0.04 50)" }}
                >
                  {card.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border" style={{ borderColor: "oklch(0.88 0.04 80)" }}>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-base font-semibold flex items-center gap-2"
            style={{ color: "oklch(0.22 0.04 50)" }}
          >
            <Package
              className="h-4 w-4"
              style={{ color: "oklch(0.62 0.18 45)" }}
            />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {["a", "b", "c", "d"].map((sk) => (
                <Skeleton key={sk} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "oklch(0.88 0.04 80)" }}>
                    <TableHead className="text-xs">Order ID</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Items</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => {
                    const statusCfg =
                      STATUS_COLORS[
                        order.status as keyof typeof STATUS_COLORS
                      ] ?? STATUS_COLORS.Pending;
                    return (
                      <TableRow
                        key={order.id.toString()}
                        style={{ borderColor: "oklch(0.88 0.04 80)" }}
                      >
                        <TableCell className="text-xs font-mono">
                          #{order.id.toString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatTimestamp(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.items.length} items
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.orderType}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
