import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { mockBackend } from "../../mocks/backend";

const LEGAL_PAGES = [
  { slug: "terms", label: "Terms & Conditions", icon: "📋" },
  { slug: "privacy", label: "Privacy Policy", icon: "🔒" },
  { slug: "refund", label: "Refund Policy", icon: "↩️" },
];

function LegalPageEditor({
  slug,
  label,
  icon,
}: { slug: string; label: string; icon: string }) {
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["legalPage", slug],
    queryFn: async () => {
      const result = await mockBackend.getLegalPage(slug);
      return result[0] ?? "";
    },
  });

  useEffect(() => {
    if (data !== undefined) {
      setContent(data);
      setHasChanges(false);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (text: string) => mockBackend.setLegalPage(slug, text),
    onSuccess: () => {
      toast.success(`${label} save ho gaya!`);
      setHasChanges(false);
    },
    onError: () => toast.error("Save karne mein problem aayi."),
  });

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "oklch(0.22 0.04 50)" }}
            >
              {label}
            </p>
            <p className="text-xs" style={{ color: "oklch(0.55 0.04 60)" }}>
              Markdown format mein likhein
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate(content)}
          disabled={saveMutation.isPending || !hasChanges}
          className="gap-1.5 text-xs"
          style={{
            background: "oklch(0.62 0.18 45)",
            color: "white",
            border: "none",
          }}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saveMutation.isPending
            ? "Saving..."
            : hasChanges
              ? "Save*"
              : "Saved"}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          rows={16}
          className="font-mono text-xs resize-y"
          placeholder={`${label} content yahan likhein...`}
          style={{
            borderColor: hasChanges ? "oklch(0.62 0.18 45)" : undefined,
          }}
        />
      )}

      {hasChanges && (
        <p className="text-xs" style={{ color: "oklch(0.6 0.1 75)" }}>
          * Unsaved changes hain. Save button dabao.
        </p>
      )}
    </div>
  );
}

export function LegalEditor() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "oklch(0.22 0.04 50)" }}
        >
          Legal Pages Editor
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.5 0.04 60)" }}>
          Legal pages ka content edit karein (Markdown format)
        </p>
      </div>

      <Card className="border" style={{ borderColor: "oklch(0.88 0.04 80)" }}>
        <CardContent className="p-0">
          <Tabs defaultValue="terms">
            <div
              className="border-b px-4"
              style={{ borderColor: "oklch(0.88 0.04 80)" }}
            >
              <TabsList className="h-auto gap-0 bg-transparent p-0 rounded-none">
                {LEGAL_PAGES.map((page) => (
                  <TabsTrigger
                    key={page.slug}
                    value={page.slug}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs px-4 py-3 gap-1.5"
                  >
                    <span>{page.icon}</span>
                    <span className="hidden sm:inline">{page.label}</span>
                    <span className="sm:hidden">{page.slug}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {LEGAL_PAGES.map((page) => (
              <TabsContent
                key={page.slug}
                value={page.slug}
                className="p-4 mt-0"
              >
                <LegalPageEditor {...page} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
