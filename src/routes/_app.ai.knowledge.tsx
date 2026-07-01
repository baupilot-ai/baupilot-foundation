import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Building2, Ruler } from "lucide-react";

export const Route = createFileRoute("/_app/ai/knowledge")({ component: Page });

function Page() {
  const items = [
    { icon: Building2, title: "Firmenwissen", desc: "Interne Richtlinien, Vorlagen und Standards deines Unternehmens." },
    { icon: FileText, title: "Interne Dokumente", desc: "Prozessbeschreibungen, Handbücher, Sicherheitsregeln." },
    { icon: Ruler, title: "DIN & Normen", desc: "Baurechtliche Vorgaben, DIN, Ö-Normen, EN-Standards." },
    { icon: BookOpen, title: "Projektstandards", desc: "Bauabläufe, Qualitätskriterien, Abnahmekriterien." },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-primary" /> Wissensdatenbank</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Zentrale Wissensbasis für dein Unternehmen. Bald verfügbar mit RAG-Unterstützung – dann durchsucht die KI automatisch deine Dokumente.
          </p>
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <Card key={it.title} className="opacity-80">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.desc}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Bald verfügbar</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
