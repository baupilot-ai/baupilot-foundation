import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Loader2, TrendingUp, AlertTriangle, Zap, CalendarDays, Flag, CalendarClock, Timer, Plus, Trash2, Edit,
  ListChecks, BarChart3, CalendarRange, CalendarCheck, AlertOctagon,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/i18n";
import {
  getScheduleModuleStats, listScheduleActivities, listMilestones, listDelayEvents,
  createDelayEvent, updateDelayEvent, deleteDelayEvent, createMilestone,
  detectOverdueTasks, DELAY_STATUS,
  type ScheduleModuleStats, type ScheduleActivity, type Milestone, type DelayEvent,
} from "@/lib/planning";

import { ScheduleTab } from "./schedule-tab";
import { GanttTab } from "./gantt-tab";
import { CalendarTab } from "./calendar-tab";
import { MilestonesTab } from "./milestones-tab";

export function ScheduleModule({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ScheduleModuleStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    setLoading(true);
    try { setStats(await getScheduleModuleStats(projectId)); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadStats(); /* eslint-disable-next-line */ }, [projectId]);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      {loading || !stats ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          <SummaryCard icon={TrendingUp} tone="info" label={t("schedule.summary.overallProgress")} value={`${stats.overallProgress}%`} />
          <SummaryCard icon={Zap} tone="danger" label={t("schedule.summary.criticalPath")} value={String(stats.criticalTasks)} />
          <SummaryCard icon={AlertTriangle} tone="warning" label={t("schedule.summary.delayedTasks")} value={String(stats.delayedTasks)} />
          <SummaryCard icon={CalendarDays} tone="info" label={t("schedule.summary.dueThisWeek")} value={String(stats.dueThisWeek)} />
          <SummaryCard icon={CalendarClock} tone="warning" label={t("schedule.summary.dueToday")} value={String(stats.dueToday)} />
          <SummaryCard icon={Flag} tone="neutral" label={t("schedule.summary.openMilestones")} value={String(stats.openMilestones)} />
          <SummaryCard icon={CalendarCheck} tone="success" label={t("schedule.summary.earliestFinish")} value={stats.earliestFinish ? formatDate(stats.earliestFinish) : "—"} />
          <SummaryCard icon={Timer} tone="neutral" label={t("schedule.summary.floatDays")} value={stats.avgFloatDays != null ? `${stats.avgFloatDays}d` : "—"} />
        </div>
      )}

      {/* Inner views */}
      <Tabs defaultValue="list" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="list"><ListChecks className="h-4 w-4" />{t("schedule.views.list")}</TabsTrigger>
            <TabsTrigger value="gantt"><BarChart3 className="h-4 w-4" />{t("schedule.views.gantt")}</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarRange className="h-4 w-4" />{t("schedule.views.calendar")}</TabsTrigger>
            <TabsTrigger value="week"><CalendarDays className="h-4 w-4" />{t("schedule.views.week")}</TabsTrigger>
            <TabsTrigger value="milestones"><Flag className="h-4 w-4" />{t("schedule.views.milestones")}</TabsTrigger>
            <TabsTrigger value="delays"><AlertOctagon className="h-4 w-4" />{t("schedule.views.delays")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list"><ScheduleTab projectId={projectId} /></TabsContent>
        <TabsContent value="gantt"><GanttTab projectId={projectId} /></TabsContent>
        <TabsContent value="calendar"><CalendarTab projectId={projectId} /></TabsContent>
        <TabsContent value="week"><WeekPlanView projectId={projectId} /></TabsContent>
        <TabsContent value="milestones" className="space-y-4">
          <MilestoneSuggestions projectId={projectId} onAdded={loadStats} />
          <MilestonesTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="delays"><DelaysView projectId={projectId} /></TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
}) {
  const toneMap = {
    info: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-destructive bg-destructive/10",
    neutral: "text-muted-foreground bg-muted",
  } as const;
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-center gap-3 p-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${toneMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============= Week Plan View =============

function WeekPlanView({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ScheduleActivity[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([listScheduleActivities(projectId), listMilestones(projectId)])
      .then(([a, m]) => { setItems(a); setMilestones(m); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const groups = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const in7 = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
    const in14 = new Date(today.getTime() + 14 * 86400000).toISOString().slice(0, 10);

    const overdue = items.filter((a) => a.finish_date && a.finish_date < todayStr && a.status !== "completed" && a.status !== "cancelled");
    const thisWeek = items.filter((a) => a.finish_date && a.finish_date >= todayStr && a.finish_date <= in7 && a.status !== "completed");
    const nextWeek = items.filter((a) => a.finish_date && a.finish_date > in7 && a.finish_date <= in14 && a.status !== "completed");
    const later = items.filter((a) => a.finish_date && a.finish_date > in14 && a.status !== "completed");
    return { overdue, thisWeek, nextWeek, later };
  }, [items]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  const hasAny = groups.overdue.length + groups.thisWeek.length + groups.nextWeek.length + groups.later.length > 0;
  if (!hasAny) return <EmptyBox label={t("schedule.empty")} />;

  return (
    <div className="space-y-4">
      {groups.overdue.length > 0 && <TaskGroup title={t("schedule.overdue")} tone="danger" items={groups.overdue} />}
      {groups.thisWeek.length > 0 && <TaskGroup title={t("schedule.thisWeek")} tone="warning" items={groups.thisWeek} />}
      {groups.nextWeek.length > 0 && <TaskGroup title={t("schedule.nextWeek")} tone="info" items={groups.nextWeek} />}
      {groups.later.length > 0 && <TaskGroup title={t("schedule.later")} tone="neutral" items={groups.later} />}
      {milestones.filter((m) => m.status !== "completed").length > 0 && (
        <Card className="border-border/70">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t("schedule.views.milestones")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {milestones.filter((m) => m.status !== "completed").map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border border-border/60 p-2 text-sm">
                <span className="inline-flex items-center gap-2"><Flag className="h-4 w-4 text-primary" />{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.planned_date ? formatDate(m.planned_date) : "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskGroup({ title, tone, items }: { title: string; tone: "danger" | "warning" | "info" | "neutral"; items: ScheduleActivity[] }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        <StatusBadge tone={tone}>{items.length}</StatusBadge>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-2 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{a.activity_name}</p>
              <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                {a.trade && <span>{a.trade}</span>}
                {a.responsible_person && <span>· {a.responsible_person}</span>}
                {a.finish_date && <span>· {formatDate(a.finish_date)}</span>}
              </div>
            </div>
            <div className="text-xs tabular-nums text-muted-foreground">{a.progress_percent ?? 0}%</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyBox({ label }: { label: string }) {
  return (
    <Card className="border-dashed border-border/70 bg-muted/30">
      <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">{label}</CardContent>
    </Card>
  );
}

// ============= Milestone suggestions =============

function MilestoneSuggestions({ projectId, onAdded }: { projectId: string; onAdded: () => void }) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState<string | null>(null);
  const suggestions: { key: string; }[] = [
    { key: "start" }, { key: "shell" }, { key: "roof" }, { key: "facade" },
    { key: "mep" }, { key: "screed" }, { key: "acceptance" }, { key: "handover" },
  ];

  async function add(key: string) {
    setAdding(key);
    try {
      await createMilestone({
        project_id: projectId,
        name: t(`schedule.milestoneSuggestions.items.${key}`),
        status: "planned",
      } as Parameters<typeof createMilestone>[0]);
      toast.success(t("planning.common.created"));
      onAdded();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Error"); }
    finally { setAdding(null); }
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2"><CardTitle className="text-sm">{t("schedule.milestoneSuggestions.title")}</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Button key={s.key} variant="outline" size="sm" disabled={adding === s.key} onClick={() => add(s.key)}>
            {adding === s.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            {t(`schedule.milestoneSuggestions.items.${s.key}`)}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

// ============= Delays View =============

function DelaysView({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<DelayEvent[]>([]);
  const [tasks, setTasks] = useState<ScheduleActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DelayEvent | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [d, a] = await Promise.all([listDelayEvents(projectId), listScheduleActivities(projectId)]);
      setItems(d); setTasks(a);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const overdueTasks = useMemo(() => detectOverdueTasks(tasks), [tasks]);
  const trackedTaskIds = new Set(items.filter((d) => d.status !== "resolved").map((d) => d.task_id));
  const untrackedOverdue = overdueTasks.filter((t) => !trackedTaskIds.has(t.id));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("schedule.delays.title")}</h3>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" />{t("schedule.delays.new")}
        </Button>
      </div>

      {untrackedOverdue.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-warning">{t("schedule.delays.autoDetected")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {untrackedOverdue.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-warning/30 bg-background p-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{task.activity_name}</p>
                  <p className="text-xs text-muted-foreground">{task.finish_date && formatDate(task.finish_date)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setEditing({ task_id: task.id } as DelayEvent); setOpen(true); }}>
                  <Plus className="h-3 w-3" />{t("schedule.delays.new")}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {items.length === 0 && untrackedOverdue.length === 0 ? (
        <EmptyBox label={t("schedule.delays.empty")} />
      ) : (
        <div className="space-y-2">
          {items.map((d) => {
            const s = DELAY_STATUS.find((x) => x.value === d.status);
            const task = tasks.find((tt) => tt.id === d.task_id);
            return (
              <Card key={d.id} className="border-border/70">
                <CardContent className="flex flex-wrap items-start justify-between gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{task?.activity_name ?? "—"}</p>
                      {s && <StatusBadge tone={s.tone}>{t(s.labelKey)}</StatusBadge>}
                      {d.impact_days != null && <span className="text-xs text-muted-foreground">+{d.impact_days}d</span>}
                    </div>
                    {d.reason && <p className="mt-1 text-sm">{d.reason}</p>}
                    <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      {d.detected_at && <span>{t("schedule.delays.detectedAt")}: {formatDate(d.detected_at)}</span>}
                      {d.resolved_at && <span>{t("schedule.delays.resolvedAt")}: {formatDate(d.resolved_at)}</span>}
                      {d.responsible_party && <span>· {d.responsible_party}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(d); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={async () => {
                      try { await deleteDelayEvent(d.id); toast.success(t("planning.common.deleted")); load(); }
                      catch (e) { toast.error(e instanceof Error ? e.message : "Error"); }
                    }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DelayDialog open={open} onOpenChange={setOpen} projectId={projectId} editing={editing} tasks={tasks} onSaved={load} />
    </div>
  );
}

function DelayDialog({
  open, onOpenChange, projectId, editing, tasks, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string;
  editing: DelayEvent | null; tasks: ScheduleActivity[]; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<DelayEvent>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(editing ?? { status: "open", detected_at: new Date().toISOString().slice(0, 10) });
  }, [open, editing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.task_id) { toast.error(t("planning.common.failed")); return; }
    setSaving(true);
    try {
      if (editing?.id) {
        await updateDelayEvent(editing.id, form);
        toast.success(t("planning.common.updated"));
      } else {
        await createDelayEvent({ ...form, project_id: projectId, task_id: form.task_id! } as Parameters<typeof createDelayEvent>[0]);
        toast.success(t("planning.common.created"));
      }
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing?.id ? t("schedule.delays.title") : t("schedule.delays.new")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t("planning.schedule.activityName")} *</Label>
            <Select value={form.task_id ?? ""} onValueChange={(v) => setForm({ ...form, task_id: v })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{tasks.map((tk) => <SelectItem key={tk.id} value={tk.id}>{tk.activity_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("schedule.delays.reason")}</Label>
            <Textarea rows={2} value={form.reason ?? ""} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("schedule.delays.impactDays")}</Label>
              <Input type="number" value={form.impact_days ?? ""} onChange={(e) => setForm({ ...form, impact_days: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("planning.common.status")}</Label>
              <Select value={form.status ?? "open"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DELAY_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("schedule.delays.detectedAt")}</Label>
              <Input type="date" value={form.detected_at ?? ""} onChange={(e) => setForm({ ...form, detected_at: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("schedule.delays.resolvedAt")}</Label>
              <Input type="date" value={form.resolved_at ?? ""} onChange={(e) => setForm({ ...form, resolved_at: e.target.value || null })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("schedule.delays.responsibleParty")}</Label>
            <Input value={form.responsible_party ?? ""} onChange={(e) => setForm({ ...form, responsible_party: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
