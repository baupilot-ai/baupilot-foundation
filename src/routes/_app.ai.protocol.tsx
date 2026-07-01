import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiGenerateProtocol } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Download } from "lucide-react";
import { Markdown, CopyButton } from "@/components/ai/markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/protocol")({ component: Page });

function Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(aiGenerateProtocol);

  async function generate() {
    setLoading(true);
    try {
      const res = await gen({ data: { input } });
      setOutput(res.markdown);
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `protokoll-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> Besprechungsprotokoll</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={14} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Notizen der Baubesprechung eingeben…" />
          <Button onClick={generate} disabled={loading || input.length < 10} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Protokoll erzeugen
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Vorschau</CardTitle>
            {output && (
              <div className="flex gap-1">
                <CopyButton text={output} />
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={download}>
                  <Download className="h-3 w-3" /> Export
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {output ? <Markdown content={output} /> : <p className="text-sm text-muted-foreground">Kein Protokoll generiert.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
