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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { mockBackend } from "../../mocks/backend";
import {
  bigIntToDate,
  formatDate,
  formatTimestamp,
} from "../../utils/dateUtils";
import { formatPrice, shortenPrincipal } from "../../utils/formatUtils";

const STATUS_COLORS = {
  Active: { color: "oklch(0.35 0.12 155)", bg: "oklch(0.35 0.12 155 / 0.12)" },
  Cancelled: { color: "oklch(0.55 0.2 25)", bg: "oklch(0.55 0.2 25 / 0.12)" },
  Completed: {
    color: "oklch(0.45 0.18 260)",
    bg: "oklch(0.45 0.18 260 / 0.12)",
  },
};

export function SubscriptionsManager() {
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<bigint | null>(null);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["allSubscriptions"],
    queryFn: () => mockBackend.getAllSubscriptions(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: bigint) => mockBackend.cancelSubscription(id),
    onSuccess: () => {
      toast.success("Subscription cancel ho gayi");
      setCancellingId(null);
      void queryClient.invalidateQueries({ queryKey: ["allSubscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: () => {
      toast.error("Cancel karne mein problem aayi.");
      setCancellingId(null);
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Subscriptions Management
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.04 60)" }}>
          Sab active aur past subscriptions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c", "d"].map((sk) => (
            <Skeleton key={sk} className="h-12 w-full" />
          ))}
        </div>
      ) : !subscriptions || subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <p
            className="font-display text-base font-semibold"
            style={{ color: "oklch(0.35 0.04 50)" }}
          >
            Koi subscription nahi mili
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
                  <TableHead className="text-xs">Sub ID</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Started</TableHead>
                  <TableHead className="text-xs">Delivery Dates</TableHead>
                  <TableHead className="text-xs">Items</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => {
                  const statusCfg =
                    STATUS_COLORS[sub.status as keyof typeof STATUS_COLORS] ??
                    STATUS_COLORS.Active;
                  const isExpanded = expandedSubId === sub.id;
                  const addr = sub.deliveryAddress;
                  return (
                    <>
                      <TableRow
                        key={sub.id.toString()}
                        style={{
                          borderColor: "oklch(0.88 0.04 80)",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setExpandedSubId(isExpanded ? null : sub.id)
                        }
                      >
                        <TableCell className="text-xs font-mono font-semibold">
                          #{sub.id.toString()}
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
                          {addr?.name || shortenPrincipal(sub.customerId)}
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
                          {formatTimestamp(sub.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar
                              className="h-3 w-3 shrink-0"
                              style={{ color: "oklch(0.35 0.1 155)" }}
                            />
                            <div
                              className="text-[10px] space-y-0.5"
                              style={{ color: "oklch(0.5 0.04 60)" }}
                            >
                              {sub.deliveryDates.slice(0, 2).map((d) => (
                                <p key={d.toString()}>
                                  {formatDate(bigIntToDate(d))}
                                </p>
                              ))}
                              {sub.deliveryDates.length > 2 && (
                                <p>+{sub.deliveryDates.length - 2} more</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {sub.items.length} items
                        </TableCell>
                        <TableCell
                          className="text-xs font-semibold"
                          style={{ color: "oklch(0.42 0.15 45)" }}
                        >
                          {formatPrice(sub.total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-[10px] border-0"
                            style={{
                              background: statusCfg.bg,
                              color: statusCfg.color,
                            }}
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end">
                            {sub.status === "Active" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-[10px] gap-1"
                                    style={{
                                      borderColor: "oklch(0.55 0.2 25)",
                                      color: "oklch(0.55 0.2 25)",
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Subscription Cancel Karein?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Sub #{sub.id.toString()} ko cancel karein?
                                      Customer ko notify kiya jaayega.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Nahi</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        setCancellingId(sub.id);
                                        cancelMutation.mutate(sub.id);
                                      }}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      {cancelMutation.isPending &&
                                      cancellingId === sub.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                      ) : null}
                                      Haan, Cancel
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {sub.status !== "Active" && (
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
                          key={`${sub.id.toString()}-addr`}
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
