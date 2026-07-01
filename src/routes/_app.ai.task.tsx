import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiGenerateTask } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/ai/task")({ component: Page });
type Draft = Awaited<ReturnType<typeof aiGenerateTask>>;

function Page() {
  const [input, setInput] = useState("");
  const [projectId, setProjectId] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(aiGenerateTask);

  async function generate() {
    setLoading(true);
    try {
      const res = await gen({ data: { input } });
      setDraft(res);
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!draft || !projectId) {
      toast.error("Projekt-ID erforderlich");
      return;
    }
    try {
      const { error } = await supabase.from("tasks").insert({
        project_id: projectId,
        title: draft.title,
        description: draft.description,
        due_date: draft.due_date,
        priority: draft.priority ?? "medium",
        status: "todo",
      } as any);
      if (error) throw error;
      toast.success("Aufgabe erstellt");
      setDraft(null);
      setInput("");
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> Aufgabe per KI</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Projekt-ID</Label><Input value={projectId} onChange={(e) => setProjectId(e.target.value)} /></div>
          <div><Label>Beschreibung</Label><Textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder="EG Schalung bis Freitag fertig." /></div>
          <Button onClick={generate} disabled={loading || !input.trim()} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Aufgabe erzeugen
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Vorschau</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {!draft && <p className="text-sm text-muted-foreground">Noch keine Vorschau.</p>}
          {draft && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Titel:</span> {draft.title}</div>
              <div><span className="font-medium">Beschreibung:</span> {draft.description ?? "—"}</div>
              <div><span className="font-medium">Fällig:</span> {draft.due_date ?? "—"}</div>
              <div><span className="font-medium">Priorität:</span> {draft.priority ?? "—"}</div>
              <div><span className="font-medium">Verantwortlich (Hinweis):</span> {draft.assignee_hint ?? "—"}</div>
              <Button onClick={save} className="w-full gap-2"><Save className="h-4 w-4" /> Speichern</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
