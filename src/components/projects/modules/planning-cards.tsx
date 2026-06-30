import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, Flag, AlertTriangle, Calendar, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/i18n";
import { getProjectPlanningStats, type ProjectPlanningStats } from "@/lib/planning";

export function ProjectPlanningCards({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [s, setS] = useState<ProjectPlanningStats | null>(null);
  useEffect(() => { getProjectPlanningStats(projectId).then(setS).catch(() => {}); }, [projectId]);
  if (!s) return null;

  const items: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: string }[] = [
    { label: t("planning.overview.progress"), value: `${s.progressPercent}%`, icon: BarChart3 },
    { label: t("planning.overview.nextMilestone"), value: s.nextMilestone?.name ?? t("planning.overview.noMilestone"), icon: Flag },
    { label: t("planning.overview.delayed"), value: String(s.delayedActivities), icon: AlertTriangle, accent: s.delayedActivities > 0 ? "text-destructive" : undefined },
    { label: t("planning.overview.upcomingDeadlines"), value: String(s.upcomingDeadlines), icon: Calendar },
    { label: t("planning.overview.eventsToday"), value: String(s.eventsToday), icon: CalendarDays },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((i) => (
        <Card key={i.label} className="border-border/70">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground"><i.icon className="h-4 w-4" /><span className="text-xs">{i.label}</span></div>
            <div className={`mt-2 truncate text-lg font-semibold ${i.accent ?? ""}`}>{i.value}</div>
            {i.label === t("planning.overview.nextMilestone") && s.nextMilestone?.planned_date && (
              <div className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(s.nextMilestone.planned_date)}</div>
            )}
            {i.label === t("planning.overview.upcomingDeadlines") && s.nextDeadline?.finish_date && (
              <div className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(s.nextDeadline.finish_date)} · {s.nextDeadline.activity_name}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
