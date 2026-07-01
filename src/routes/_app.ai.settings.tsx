import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai/settings")({ component: Page });

const MODELS = [
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (Standard, schnell)" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (stark)" },
  { value: "openai/gpt-5", label: "GPT-5 (Premium, vorbereitet)" },
  { value: "openai/gpt-5-mini", label: "GPT-5 mini (vorbereitet)" },
];

function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [model, setModel] = useState("google/gemini-3-flash-preview");
  const [temperature, setTemperature] = useState("0.4");
  const [maxTokens, setMaxTokens] = useState("2000");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [provider, setProvider] = useState("lovable");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("ai_settings" as any).select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        const d = data as any;
        setModel(d.default_model ?? model);
        setTemperature(String(d.temperature ?? 0.4));
        setMaxTokens(String(d.max_tokens ?? 2000));
        setSystemPrompt(d.system_prompt ?? "");
        setProvider(d.provider ?? "lovable");
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");
      const { data: prof } = await supabase.from("profiles").select("company_id").eq("id", user.id).maybeSingle();
      const payload = {
        user_id: user.id,
        company_id: prof?.company_id,
        default_model: model,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
        system_prompt: systemPrompt || null,
        provider,
      };
      const { error } = await supabase.from("ai_settings" as any).upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Einstellungen gespeichert");
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Laden…</div>;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-4 w-4 text-primary" /> KI-Einstellungen</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Modell</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lovable">Lovable AI Gateway (aktiv)</SelectItem>
                <SelectItem value="openai" disabled>OpenAI direkt (vorbereitet)</SelectItem>
                <SelectItem value="azure" disabled>Azure OpenAI (vorbereitet)</SelectItem>
                <SelectItem value="local" disabled>Lokales Modell (vorbereitet)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Temperatur</Label>
            <Input type="number" step="0.1" min="0" max="2" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
          </div>
          <div>
            <Label>Max Tokens</Label>
            <Input type="number" min="100" max="8000" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>System Prompt (optional)</Label>
          <Textarea rows={4} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="Überschreibe den Standard-System-Prompt…" />
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Speichern
        </Button>
      </CardContent>
    </Card>
  );
}
