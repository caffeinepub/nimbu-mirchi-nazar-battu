import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type CmsData, mockBackend } from "../../mocks/backend";

export function CmsEditor() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CmsData>({
    bannerTitle: "",
    bannerSubtitle: "",
    tagline: "",
    popupMessage: "",
    popupEnabled: false,
  });

  const { data: cmsData, isLoading } = useQuery({
    queryKey: ["cmsData"],
    queryFn: () => mockBackend.getCmsData(),
  });

  useEffect(() => {
    if (cmsData) {
      setForm(cmsData);
    }
  }, [cmsData]);

  const updateMutation = useMutation({
    mutationFn: (data: CmsData) => mockBackend.updateCmsData(data),
    onSuccess: () => {
      toast.success("CMS data save ho gaya!");
      void queryClient.invalidateQueries({ queryKey: ["cmsData"] });
    },
    onError: () => toast.error("Save karne mein problem aayi."),
  });

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          CMS Editor
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.04 60)" }}>
          Homepage banner aur popup edit karein
        </p>
      </div>

      {/* Hero Banner Section */}
      <Card className="border" style={{ borderColor: "oklch(0.88 0.04 80)" }}>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: "oklch(0.22 0.04 50)" }}
          >
            <FileText
              className="h-4 w-4"
              style={{ color: "oklch(0.62 0.18 45)" }}
            />
            Hero Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs mb-1.5 block">
              Banner Title{" "}
              <span style={{ color: "oklch(0.55 0.2 25)" }}>*</span>
            </Label>
            <Input
              value={form.bannerTitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, bannerTitle: e.target.value }))
              }
              placeholder="e.g. Nimbu Mirchi Nazar Battu"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Banner Subtitle</Label>
            <Input
              value={form.bannerSubtitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, bannerSubtitle: e.target.value }))
              }
              placeholder="e.g. Pracheen Indian parampara se bani nazar suraksha"
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Tagline</Label>
            <Textarea
              value={form.tagline}
              onChange={(e) =>
                setForm((f) => ({ ...f, tagline: e.target.value }))
              }
              placeholder="e.g. Ghar, Dukaan aur Gaadi ko Nazar se Bachao"
              rows={2}
              className="text-sm resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Popup Section */}
      <Card className="border" style={{ borderColor: "oklch(0.88 0.04 80)" }}>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: "oklch(0.22 0.04 50)" }}
          >
            🔔 Popup Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="popupEnabled"
              checked={form.popupEnabled}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, popupEnabled: v }))
              }
            />
            <Label htmlFor="popupEnabled" className="text-sm cursor-pointer">
              Popup {form.popupEnabled ? "Enable" : "Disable"} karo
            </Label>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: form.popupEnabled
                  ? "oklch(0.35 0.12 155 / 0.12)"
                  : "oklch(0.93 0.02 85)",
                color: form.popupEnabled
                  ? "oklch(0.35 0.12 155)"
                  : "oklch(0.6 0.04 60)",
              }}
            >
              {form.popupEnabled ? "Active" : "Hidden"}
            </span>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Popup Message</Label>
            <Textarea
              value={form.popupMessage}
              onChange={(e) =>
                setForm((f) => ({ ...f, popupMessage: e.target.value }))
              }
              placeholder="e.g. 🍋 Nayi arrival! Premium Ghar Nazar Protection Set ab ₹799 mein."
              rows={3}
              className="text-sm resize-none"
              disabled={!form.popupEnabled}
            />
          </div>

          {/* Preview */}
          {form.popupEnabled && form.popupMessage && (
            <div
              className="p-3 rounded-lg border"
              style={{
                background: "oklch(0.16 0.05 155)",
                borderColor: "oklch(0.25 0.06 155)",
              }}
            >
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "oklch(0.62 0.1 155)" }}
              >
                Preview:
              </p>
              <p className="text-xs" style={{ color: "oklch(0.85 0.06 85)" }}>
                {form.popupMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="gap-2"
          style={{
            background: "oklch(0.62 0.18 45)",
            color: "white",
            border: "none",
          }}
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
