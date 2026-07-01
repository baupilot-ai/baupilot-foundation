import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiGenerateDailyReport } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/ai/daily-report")({ component: Page });

type Draft = Awaited<ReturnType<typeof aiGenerateDailyReport>>;

function Page() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const gen = useServerFn(aiGenerateDailyReport);

  async function generate() {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await gen({ data: { input } });
      setDraft(res);
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler bei KI-Generierung");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!draft || !projectId) {
      toast.error("Bitte Projekt-ID angeben");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("daily_reports").insert({
        project_id: projectId,
        report_date: new Date().toISOString().slice(0, 10),
        weather: draft.weather,
        summary: draft.summary,
        work_summary: draft.work_performed,
        delays: draft.delays,
        incidents: draft.incidents,
        status: "draft",
      } as any);
      if (error) throw error;
      toast.success("Bautagesbericht gespeichert");
      setDraft(null);
      setInput("");
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> Bautagesbericht mit KI erstellen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="project">Projekt-ID (optional)</Label>
            <Input id="project" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="UUID des Projekts" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notizen von der Baustelle</Label>
            <Textarea
              id="notes"
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Heute Decke betoniert. 22 Mitarbeiter. Sonnig. Keine Unfälle. Beton C30/37."
            />
          </div>
          <Button onClick={generate} disabled={loading || !input.trim()} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Mit KI erstellen
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vorschau</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!draft && <p className="text-sm text-muted-foreground">Noch keine Vorschau. Generiere zuerst einen Entwurf.</p>}
          {draft && (
            <div className="space-y-2 text-sm">
              <Row label="Wetter" value={draft.weather} />
              <Row label="Temperatur" value={draft.temperature} />
              <Row label="Personal" value={draft.workforce_count?.toString() ?? null} />
              <Row label="Ausgeführte Arbeiten" value={draft.work_performed} />
              <Row label="Material" value={draft.materials} />
              <Row label="Geräte" value={draft.equipment} />
              <Row label="Behinderungen" value={draft.delays} />
              <Row label="Vorfälle" value={draft.incidents} />
              <Row label="Zusammenfassung" value={draft.summary} />
              <Button onClick={save} disabled={saving || !projectId} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Bericht speichern
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2 border-b pb-2 last:border-0">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
