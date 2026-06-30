import { useEffect, useState } from "react";
import { CalendarDays, CheckSquare, AlertOctagon, Camera, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getProjectQuickStats } from "@/lib/site-modules";

export function ProjectQuickStats({ projectId }: { projectId: string }) {
  const [s, setS] = useState<Awaited<ReturnType<typeof getProjectQuickStats>> | null>(null);
  useEffect(() => { getProjectQuickStats(projectId).then(setS).catch(() => {}); }, [projectId]);
  if (!s) return null;
  const items = [
    { label: "Daily reports", value: s.dailyReportsCount, icon: CalendarDays, sub: s.latestReportDate ? `Last: ${new Date(s.latestReportDate).toLocaleDateString()}` : "No reports" },
    { label: "Open tasks", value: s.openTasksCount, icon: CheckSquare, sub: s.nextDueTask?.due_date ? `Next: ${new Date(s.nextDueTask.due_date).toLocaleDateString()}` : (s.nextDueTask ? "No due date" : "—") },
    { label: "Open defects", value: s.openDefectsCount, icon: AlertOctagon, sub: "" },
    { label: "Photos", value: s.photosCount, icon: Camera, sub: "" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
