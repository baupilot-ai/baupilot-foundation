import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiProjectSummary } from "@/lib/ai.functions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { Markdown, CopyButton } from "@/components/ai/markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/summary")({ component: Page });

function Page() {
  const [projectId, setProjectId] = useState<string>("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(aiProjectSummary);

  const { data: projects = [] } = useQuery({
    queryKey: ["ai_summary_projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id,name").order("name");
      return data ?? [];
    },
  });

  async function run() {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await gen({ data: { projectId } });
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> Projekt zusammenfassen</CardTitle>
          <div className="flex gap-2">
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Projekt wählen…" /></SelectTrigger>
              <SelectContent>
                {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={run} disabled={!projectId || loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Zusammenfassen
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {output ? (
          <div className="space-y-2">
            <div className="flex justify-end"><CopyButton text={output} /></div>
            <Markdown content={output} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Wähle ein Projekt und klicke „Zusammenfassen".</p>
        )}
      </CardContent>
    </Card>
  );
}
