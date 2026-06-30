import { useEffect, useState } from "react";
import { CalendarDays, CheckSquare, AlertOctagon, Camera, Calendar, FileText, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getProjectQuickStats } from "@/lib/site-modules";
import { getDocumentsPlansStats } from "@/lib/documents";

type DocStats = Awaited<ReturnType<typeof getDocumentsPlansStats>>;
type CoreStats = Awaited<ReturnType<typeof getProjectQuickStats>>;

export function ProjectQuickStats({ projectId }: { projectId: string }) {
  const [s, setS] = useState<CoreStats | null>(null);
  const [d, setD] = useState<DocStats | null>(null);
  useEffect(() => {
    getProjectQuickStats(projectId).then(setS).catch(() => {});
    getDocumentsPlansStats(projectId).then(setD).catch(() => {});
  }, [projectId]);
  if (!s) return null;
  const items: Array<{ label: string; value: number; icon: React.ComponentType<{ className?: string }>; sub: string }> = [
    { label: "Daily reports", value: s.dailyReportsCount, icon: CalendarDays, sub: s.latestReportDate ? `Last: ${new Date(s.latestReportDate).toLocaleDateString()}` : "No reports" },
    { label: "Open tasks", value: s.openTasksCount, icon: CheckSquare, sub: s.nextDueTask?.due_date ? `Next: ${new Date(s.nextDueTask.due_date).toLocaleDateString()}` : (s.nextDueTask ? "No due date" : "—") },
    { label: "Open defects", value: s.openDefectsCount, icon: AlertOctagon, sub: "" },
    { label: "Photos", value: s.photosCount, icon: Camera, sub: "" },
    { label: "Documents", value: d?.documentsCount ?? 0, icon: FileText, sub: d?.latestDocument?.created_at ? `Last: ${new Date(d.latestDocument.created_at).toLocaleDateString()}` : "" },
    { label: "Plans", value: d?.plansCount ?? 0, icon: Layers, sub: d?.latestPlan?.created_at ? `Rev ${d.latestPlan.revision} · ${new Date(d.latestPlan.created_at).toLocaleDateString()}` : "" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((i) => (
        <Card key={i.label} className="border-border/70">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><i.icon className="h-4 w-4" /><span className="text-xs">{i.label}</span></div>
            <div className="mt-2 text-2xl font-semibold">{i.value}</div>
            {i.sub && <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Calendar className="h-3 w-3" />{i.sub}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
