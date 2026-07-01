import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiSearch } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Markdown } from "@/components/ai/markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/search")({ component: Page });

const EXAMPLES = [
  "Zeige alle offenen Mängel",
  "Welche Betonagen letzte Woche?",
  "Welche Dokumente fehlen?",
  "Welche Aufgaben sind überfällig?",
];

function Page() {
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(aiSearch);

  async function run(q?: string) {
    const finalQuery = q ?? query;
    if (!finalQuery.trim()) return;
    if (q) setQuery(q);
    setLoading(true);
    try {
      const res = await gen({ data: { query: finalQuery } });
      setOutput(res.markdown);
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Search className="h-4 w-4 text-primary" /> KI-Suche</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => { e.preventDefault(); run(); }}
          className="flex gap-2"
        >
          <Input placeholder="Frage stellen…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button type="submit" disabled={loading || !query.trim()} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Suchen
          </Button>
        </form>

        {!output && (
          <div className="grid gap-2 sm:grid-cols-2">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => run(ex)} className="rounded-lg border p-3 text-left text-xs hover:border-primary hover:bg-primary/5">
                {ex}
              </button>
            ))}
          </div>
        )}

        {output && <Markdown content={output} />}
      </CardContent>
    </Card>
  );
}
