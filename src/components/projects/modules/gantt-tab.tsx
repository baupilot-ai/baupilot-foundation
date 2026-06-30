import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Flag, BarChart3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, getAppLanguage } from "@/lib/i18n";
import {
  listScheduleActivities, listMilestones, listDependencies, SCHEDULE_STATUS,
  type ScheduleActivity, type Milestone, type ScheduleDependency,
} from "@/lib/planning";

type Zoom = "week" | "month" | "quarter";

const PX_PER_DAY: Record<Zoom, number> = { week: 32, month: 10, quarter: 4 };

export function GanttTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ScheduleActivity[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [deps, setDeps] = useState<ScheduleDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState<Zoom>("month");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listScheduleActivities(projectId),
      listMilestones(projectId),
      listDependencies(projectId),
    ]).then(([a, m, d]) => { setActivities(a); setMilestones(m); setDeps(d); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const range = useMemo(() => {
    const dates: number[] = [];
    activities.forEach((a) => { if (a.start_date) dates.push(new Date(a.start_date).getTime()); if (a.finish_date) dates.push(new Date(a.finish_date).getTime()); });
    milestones.forEach((m) => { if (m.planned_date) dates.push(new Date(m.planned_date).getTime()); });
    if (dates.length === 0) return null;
    const min = new Date(Math.min(...dates)); min.setDate(min.getDate() - 3); min.setHours(0, 0, 0, 0);
    const max = new Date(Math.max(...dates)); max.setDate(max.getDate() + 3); max.setHours(0, 0, 0, 0);
    const totalDays = Math.ceil((max.getTime() - min.getTime()) / 86400000) + 1;
    return { min, max, totalDays };
  }, [activities, milestones]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (!range) {
    return (
      <Card className="border-dashed border-border/70 bg-muted/30">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">{t("planning.gantt.empty")}</p>
        </CardContent>
      </Card>
    );
  }

  const pxPerDay = PX_PER_DAY[zoom];
  const totalWidth = range.totalDays * pxPerDay;
  const lang = getAppLanguage() === "de" ? "de-DE" : "en-US";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOffset = Math.floor((today.getTime() - range.min.getTime()) / 86400000) * pxPerDay;

  function dayOffset(d: string) {
    return Math.floor((new Date(d).getTime() - range.min.getTime()) / 86400000) * pxPerDay;
  }
  function durationPx(start: string, finish: string) {
    const days = Math.max(1, Math.round((new Date(finish).getTime() - new Date(start).getTime()) / 86400000) + 1);
    return days * pxPerDay;
  }

  // Build month headers
  const monthMarks: { offset: number; label: string }[] = [];
  let m = new Date(range.min.getFullYear(), range.min.getMonth(), 1);
  while (m.getTime() <= range.max.getTime()) {
    const off = Math.floor((m.getTime() - range.min.getTime()) / 86400000) * pxPerDay;
    monthMarks.push({ offset: off, label: m.toLocaleDateString(lang, { month: "short", year: "2-digit" }) });
    m = new Date(m.getFullYear(), m.getMonth() + 1, 1);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={zoom} onValueChange={(v) => setZoom(v as Zoom)}>
          <TabsList>
            <TabsTrigger value="week">{t("planning.gantt.week")}</TabsTrigger>
            <TabsTrigger value="month">{t("planning.gantt.month")}</TabsTrigger>
            <TabsTrigger value="quarter">{t("planning.gantt.quarter")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="text-xs text-muted-foreground">{deps.length > 0 && `${deps.length} ${t("planning.dependencies.title")}`}</div>
      </div>

      <Card className="border-border/70 overflow-hidden">
        <div className="flex">
          {/* labels column */}
          <div className="w-[180px] shrink-0 border-r border-border/70 bg-muted/30">
            <div className="h-10 border-b border-border/70 px-3 py-2 text-xs font-medium">{t("planning.schedule.title")}</div>
            {activities.map((a) => (
              <div key={a.id} className="flex h-9 items-center border-b border-border/40 px-3 text-xs">
                <span className="truncate">{a.activity_number ? `${a.activity_number} · ` : ""}{a.activity_name}</span>
              </div>
            ))}
            {milestones.length > 0 && <div className="h-9 border-b border-border/40 bg-muted/20 px-3 py-2 text-xs font-medium">{t("planning.milestones.title")}</div>}
            {milestones.map((ms) => (
              <div key={ms.id} className="flex h-9 items-center border-b border-border/40 px-3 text-xs">
                <span className="truncate">{ms.name}</span>
              </div>
            ))}
          </div>

          {/* timeline */}
          <div className="overflow-x-auto">
            <div style={{ width: totalWidth, minWidth: totalWidth }} className="relative">
              {/* header */}
              <div className="relative h-10 border-b border-border/70 bg-muted/30">
                {monthMarks.map((mm, i) => (
                  <div key={i} className="absolute top-0 h-full border-l border-border/60 px-1.5 py-2 text-[10px] font-medium" style={{ left: mm.offset }}>{mm.label}</div>
                ))}
              </div>

              {/* today line */}
              {todayOffset >= 0 && todayOffset <= totalWidth && (
                <div className="absolute top-0 bottom-0 z-10 w-0.5 bg-primary/70" style={{ left: todayOffset }} />
              )}

              {/* activity rows */}
              {activities.map((a) => {
                const s = SCHEDULE_STATUS.find((x) => x.value === a.status);
                const delayed = a.status === "delayed";
                const completed = a.status === "completed";
                if (!a.start_date || !a.finish_date) {
                  return <div key={a.id} className="h-9 border-b border-border/40" />;
                }
                const left = dayOffset(a.start_date);
                const width = Math.max(pxPerDay, durationPx(a.start_date, a.finish_date));
                const progressW = (width * (a.progress_percent ?? 0)) / 100;
                return (
                  <div key={a.id} className="relative h-9 border-b border-border/40">
                    <div
                      title={`${a.activity_name} · ${s ? a.status : ""} · ${a.progress_percent ?? 0}%`}
                      className={`absolute top-1.5 h-6 rounded ${delayed ? "bg-destructive/20 ring-1 ring-destructive/40" : completed ? "bg-success/20 ring-1 ring-success/40" : "bg-primary/15 ring-1 ring-primary/30"}`}
                      style={{ left, width }}
                    >
                      <div className={`h-full rounded ${delayed ? "bg-destructive/60" : completed ? "bg-success/60" : "bg-primary/60"}`} style={{ width: progressW }} />
                    </div>
                  </div>
                );
              })}

              {milestones.length > 0 && <div className="h-9 border-b border-border/40 bg-muted/20" />}
              {milestones.map((ms) => {
                if (!ms.planned_date) return <div key={ms.id} className="h-9 border-b border-border/40" />;
                const left = dayOffset(ms.planned_date);
                return (
                  <div key={ms.id} className="relative h-9 border-b border-border/40">
                    <div className="absolute top-2" style={{ left: left - 8 }} title={`${ms.name} · ${formatDate(ms.planned_date)}`}>
                      <Flag className="h-5 w-5 fill-primary text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* legend */}
      <div className="flex flex-wrap gap-2">
        {SCHEDULE_STATUS.map((s) => <StatusBadge key={s.value} tone={s.tone}>{t(s.labelKey)}</StatusBadge>)}
      </div>
    </div>
  );
}
