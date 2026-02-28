import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit2,
  Loader2,
  Package,
  Plus,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Product, mockBackend } from "../../mocks/backend";
import { formatPrice, rupeesToPaise } from "../../utils/formatUtils";

interface ProductFormData {
  name: string;
  description: string;
  price: string; // rupees string
  category: string;
  imageUrl: string;
  isActive: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  category: "Home",
  imageUrl: "",
  isActive: true,
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Home: "🏠",
  Shop: "🏪",
  Car: "🚗",
};

export function ProductsManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);

  const { data: products, isLoading } = useQuery({
    queryKey: ["allProductsAdmin"],
    queryFn: () => mockBackend.getAllProductsAdmin(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      mockBackend.createProduct(
        form.name,
        form.description,
        rupeesToPaise(Number.parseFloat(form.price) || 0),
        form.category,
        form.imageUrl,
      ),
    onSuccess: () => {
      toast.success("Product create ho gaya!");
      void queryClient.invalidateQueries({ queryKey: ["allProductsAdmin"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Product create karne mein problem aayi."),
  });

  const updateMutation = useMutation({
    mutationFn: async (): Promise<[] | [Product]> => {
      if (!editingProduct) return [];
      return mockBackend.updateProduct(
        editingProduct.id,
        form.name,
        form.description,
        rupeesToPaise(Number.parseFloat(form.price) || 0),
        form.category,
        form.imageUrl,
        form.isActive,
      );
    },
    onSuccess: () => {
      toast.success("Product update ho gaya!");
      void queryClient.invalidateQueries({ queryKey: ["allProductsAdmin"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      setEditingProduct(null);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Update karne mein problem aayi."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: bigint) => mockBackend.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deactivate ho gaya");
      void queryClient.invalidateQueries({ queryKey: ["allProductsAdmin"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Delete karne mein problem aayi."),
  });

  const seedMutation = useMutation({
    mutationFn: () => mockBackend.seedProducts(),
    onSuccess: () => {
      toast.success("Products seed ho gaye!");
      void queryClient.invalidateQueries({ queryKey: ["allProductsAdmin"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toString(),
      category: product.category,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.price || !form.category) {
      toast.error("Sabhi required fields bharo");
      return;
    }
    if (editingProduct) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "oklch(0.22 0.04 50)" }}
          >
            Products Management
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.04 60)" }}>
            {products?.length ?? 0} total products
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="text-xs"
          >
            {seedMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : null}
            Seed Products
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 text-xs"
            style={{
              background: "oklch(0.62 0.18 45)",
              color: "white",
              border: "none",
            }}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c", "d", "e"].map((sk) => (
            <Skeleton key={sk} className="h-12 w-full" />
          ))}
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
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Price</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow
                    key={product.id.toString()}
                    style={{ borderColor: "oklch(0.88 0.04 80)" }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">
                          {CATEGORY_EMOJIS[product.category] ?? "🧿"}
                        </span>
                        <div>
                          <p
                            className="text-xs font-medium line-clamp-1"
                            style={{ color: "oklch(0.22 0.04 50)" }}
                          >
                            {product.name}
                          </p>
                          <p
                            className="text-[10px] line-clamp-1"
                            style={{ color: "oklch(0.55 0.04 60)" }}
                          >
                            {product.description.slice(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-[10px] border-0"
                        style={{
                          background: "oklch(0.93 0.02 85)",
                          color: "oklch(0.5 0.04 60)",
                        }}
                      >
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.42 0.15 45)" }}
                    >
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-[10px] border-0"
                        style={{
                          background: product.isActive
                            ? "oklch(0.45 0.15 155 / 0.12)"
                            : "oklch(0.55 0.2 25 / 0.12)",
                          color: product.isActive
                            ? "oklch(0.35 0.12 155)"
                            : "oklch(0.45 0.18 25)",
                        }}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenEdit(product)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        {product.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(product.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct
                ? "Product Edit Karein"
                : "Naya Product Add Karein"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs mb-1.5 block">Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Nimbu Mirchi Nazar Kavach"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Product ki detail..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">Price (₹) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="e.g. 299"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">🏠 Home</SelectItem>
                    <SelectItem value="Shop">🏪 Shop</SelectItem>
                    <SelectItem value="Car">🚗 Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">
                Image URL (optional)
              </Label>
              <Input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
                className="text-sm"
              />
            </div>
            {editingProduct && (
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
                <Label htmlFor="isActive" className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <ToggleLeft className="h-3.5 w-3.5" />
                    Product Active hai
                  </div>
                </Label>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isPending}
              className="gap-1.5 text-xs"
              style={{
                background: "oklch(0.62 0.18 45)",
                color: "white",
                border: "none",
              }}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Package className="h-3.5 w-3.5" />
              )}
              {editingProduct ? "Update Karein" : "Create Karein"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
