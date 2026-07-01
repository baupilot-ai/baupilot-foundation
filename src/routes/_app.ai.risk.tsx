import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { aiRiskAnalysis } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ai/risk")({ component: Page });

type Risk = {
  project_id: string;
  project_name: string;
  schedule_risk: "green" | "yellow" | "red";
  cost_risk: "green" | "yellow" | "red";
  quality_risk: "green" | "yellow" | "red";
  resource_risk: "green" | "yellow" | "red";
  material_risk: "green" | "yellow" | "red";
  document_risk: "green" | "yellow" | "red";
  reasoning: string;
};

const LIGHT: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
};

function Page() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(aiRiskAnalysis);

  async function run() {
    setLoading(true);
    try {
      const res = await gen({ data: {} });
      setRisks(res.risks as Risk[]);
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler");
    } finally {
      setLoading(false);
    }
  }

  const dims: [keyof Risk, string][] = [
    ["schedule_risk", "Termin"],
    ["cost_risk", "Kosten"],
    ["quality_risk", "Qualität"],
    ["resource_risk", "Personal"],
    ["material_risk", "Material"],
    ["document_risk", "Dokumente"],
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="h-4 w-4 text-primary" /> Risikoanalyse</CardTitle>
            <Button onClick={run} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />} Analyse starten
            </Button>
          </div>
        </CardHeader>
      </Card>

      {risks.length === 0 && !loading && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Noch keine Analyse durchgeführt.</CardContent></Card>
      )}

      {risks.map((r) => (
        <Card key={r.project_id}>
          <CardHeader><CardTitle className="text-sm">{r.project_name}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {dims.map(([key, label]) => (
                <div key={key} className="flex flex-col items-center gap-1 rounded-lg border p-2">
                  <div className={cn("h-4 w-4 rounded-full", LIGHT[r[key] as string] ?? "bg-muted")} />
                  <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{r.reasoning}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
