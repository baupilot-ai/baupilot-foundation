import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Loader2, CalendarIcon, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, getAppLanguage } from "@/lib/i18n";
import {
  listCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
  EVENT_TYPES, EVENT_STATUS, type CalendarEvent,
} from "@/lib/planning";

type View = "month" | "week" | "day" | "list";

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday-start
  x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) { const x = new Date(d.getFullYear(), d.getMonth(), 1); x.setHours(0, 0, 0, 0); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

export function CalendarTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [confirmDel, setConfirmDel] = useState<CalendarEvent | null>(null);
  const [typeF, setTypeF] = useState("all");
  const [statusF, setStatusF] = useState("all");

  async function load() {
    setLoading(true);
    try { setItems(await listCalendarEvents(projectId)); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = useMemo(() => {
    let f = items;
    if (typeF !== "all") f = f.filter((e) => e.event_type === typeF);
    if (statusF !== "all") f = f.filter((e) => e.status === statusF);
    return f;
  }, [items, typeF, statusF]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as View)}>
            <TabsList>
              <TabsTrigger value="month">{t("planning.calendar.view.month")}</TabsTrigger>
              <TabsTrigger value="week">{t("planning.calendar.view.week")}</TabsTrigger>
              <TabsTrigger value="day">{t("planning.calendar.view.day")}</TabsTrigger>
              <TabsTrigger value="list">{t("planning.calendar.view.list")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={typeF} onValueChange={setTypeF}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("planning.common.allTypes")}</SelectItem>
              {EVENT_TYPES.map((e) => <SelectItem key={e.value} value={e.value}>{t(e.labelKey)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("planning.common.allStatus")}</SelectItem>
              {EVENT_STATUS.map((e) => <SelectItem key={e.value} value={e.value}>{t(e.labelKey)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("planning.calendar.new")}</Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => setCursor((c) => view === "month" ? new Date(c.getFullYear(), c.getMonth() - 1, 1) : view === "week" ? addDays(c, -7) : addDays(c, -1))}>‹</Button>
          <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>{t("planning.common.today")}</Button>
          <Button size="sm" variant="outline" onClick={() => setCursor((c) => view === "month" ? new Date(c.getFullYear(), c.getMonth() + 1, 1) : view === "week" ? addDays(c, 7) : addDays(c, 1))}›</Button>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {cursor.toLocaleDateString(getAppLanguage() === "de" ? "de-DE" : "en-US", { month: "long", year: "numeric", day: view === "day" ? "numeric" : undefined })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : view === "month" ? (
        <MonthView cursor={cursor} events={filtered} onEventClick={(ev) => { setEditing(ev); setOpen(true); }} />
      ) : view === "week" ? (
        <WeekView cursor={cursor} events={filtered} onEventClick={(ev) => { setEditing(ev); setOpen(true); }} />
      ) : view === "day" ? (
        <DayView cursor={cursor} events={filtered} onEventClick={(ev) => { setEditing(ev); setOpen(true); }} />
      ) : (
        <ListView events={filtered} onEdit={(ev) => { setEditing(ev); setOpen(true); }} onDelete={setConfirmDel} />
      )}

      <EventDialog open={open} onOpenChange={setOpen} projectId={projectId} editing={editing} onSaved={load} />
      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("planning.common.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("planning.common.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteCalendarEvent(confirmDel.id, projectId); toast.success(t("planning.common.deleted")); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
              }}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function eventColor(type: string) {
  switch (type) {
    case "milestone": return "bg-primary/15 text-primary border-primary/30";
    case "delivery": return "bg-info/15 text-info border-info/30";
    case "inspection": return "bg-warning/15 text-warning-foreground border-warning/30";
    case "meeting": return "bg-success/15 text-success border-success/30";
    case "daily_report": return "bg-muted text-foreground border-border";
    case "schedule_activity": return "bg-info/10 text-info border-info/20";
    case "task": return "bg-warning/10 text-warning-foreground border-warning/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

function MonthView({ cursor, events, onEventClick }: { cursor: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
  const monthStart = startOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const lang = getAppLanguage() === "de" ? "de-DE" : "en-US";
  const today = new Date();
  return (
    <Card className="border-border/70 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border/70 bg-muted/40 text-xs font-medium">
        {Array.from({ length: 7 }, (_, i) => addDays(gridStart, i)).map((d) => (
          <div key={i} className="p-2 text-center">{d.toLocaleDateString(lang, { weekday: "short" })}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const dayEvents = events.filter((e) => sameDay(new Date(e.start_datetime), d));
          return (
            <div key={i} className={`min-h-[88px] border-b border-r border-border/50 p-1.5 ${inMonth ? "" : "bg-muted/30"} ${sameDay(d, today) ? "ring-1 ring-inset ring-primary/40" : ""}`}>
              <div className={`text-xs ${sameDay(d, today) ? "font-bold text-primary" : inMonth ? "text-foreground" : "text-muted-foreground"}`}>{d.getDate()}</div>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <button key={e.id} onClick={() => onEventClick(e)} className={`block w-full truncate rounded border px-1 py-0.5 text-left text-[10px] ${eventColor(e.event_type)}`}>{e.title}</button>
                ))}
                {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function WeekView({ cursor, events, onEventClick }: { cursor: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const lang = getAppLanguage() === "de" ? "de-DE" : "en-US";
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((d) => {
        const dayEvents = events.filter((e) => sameDay(new Date(e.start_datetime), d));
        return (
          <Card key={d.toISOString()} className="border-border/70">
            <CardContent className="p-3">
              <div className="mb-2 text-xs font-medium">{d.toLocaleDateString(lang, { weekday: "short", day: "2-digit", month: "2-digit" })}</div>
              <div className="space-y-1">
                {dayEvents.length === 0 ? <div className="text-[10px] text-muted-foreground">—</div> : dayEvents.map((e) => (
                  <button key={e.id} onClick={() => onEventClick(e)} className={`block w-full truncate rounded border px-1.5 py-1 text-left text-xs ${eventColor(e.event_type)}`}>{e.title}</button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DayView({ cursor, events, onEventClick }: { cursor: Date; events: CalendarEvent[]; onEventClick: (e: CalendarEvent) => void }) {
  const dayEvents = events.filter((e) => sameDay(new Date(e.start_datetime), cursor)).sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));
  return (
    <div className="space-y-2">
      {dayEvents.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30"><CardContent className="py-12 text-center text-sm text-muted-foreground">—</CardContent></Card>
      ) : dayEvents.map((e) => (
        <button key={e.id} onClick={() => onEventClick(e)} className={`block w-full rounded-lg border p-3 text-left ${eventColor(e.event_type)}`}>
          <div className="text-sm font-semibold">{e.title}</div>
          <div className="mt-0.5 text-xs opacity-80">{new Date(e.start_datetime).toLocaleTimeString()}{e.location ? ` · ${e.location}` : ""}</div>
        </button>
      ))}
    </div>
  );
}

function ListView({ events, onEdit, onDelete }: { events: CalendarEvent[]; onEdit: (e: CalendarEvent) => void; onDelete: (e: CalendarEvent) => void }) {
  const { t } = useTranslation();
  if (events.length === 0) {
    return <Card className="border-dashed border-border/70 bg-muted/30"><CardContent className="py-12 text-center text-sm text-muted-foreground">{t("planning.common.empty")}</CardContent></Card>;
  }
  return (
    <div className="grid gap-2">
      {events.map((e) => {
        const s = EVENT_STATUS.find((x) => x.value === e.status);
        const ty = EVENT_TYPES.find((x) => x.value === e.event_type);
        return (
          <Card key={e.id} className="border-border/70">
            <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{e.title}</p>
                  {s && <StatusBadge tone={s.tone}>{t(s.labelKey)}</StatusBadge>}
                  {ty && <span className="text-xs text-muted-foreground">· {t(ty.labelKey)}</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{formatDate(e.start_datetime)}</span>
                  {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => onEdit(e)}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(e)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function EventDialog({
  open, onOpenChange, projectId, editing, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string;
  editing: CalendarEvent | null; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<CalendarEvent>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(editing ?? { event_type: "other", status: "planned", all_day: false, start_datetime: new Date().toISOString().slice(0, 16) });
  }, [open, editing]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim() || !form.start_datetime) { toast.error(t("planning.common.failed")); return; }
    setSaving(true);
    try {
      const payload = { ...form, project_id: projectId, title: form.title, start_datetime: new Date(form.start_datetime).toISOString() } as Parameters<typeof createCalendarEvent>[0];
      if (form.end_datetime) payload.end_datetime = new Date(form.end_datetime).toISOString();
      if (editing) { await updateCalendarEvent(editing.id, payload, projectId); toast.success(t("planning.common.updated")); }
      else { await createCalendarEvent(payload); toast.success(t("planning.common.created")); }
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
    finally { setSaving(false); }
  }

  function toInputValue(v: string | null | undefined) {
    if (!v) return "";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? t("planning.calendar.edit") : t("planning.calendar.new")}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">{t("planning.calendar.eventTitle")} *</Label>
            <Input required value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.description")}</Label>
            <Textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.calendar.eventType")}</Label>
              <Select value={form.event_type ?? "other"} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EVENT_TYPES.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.status")}</Label>
              <Select value={form.status ?? "planned"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EVENT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.calendar.startDate")} *</Label>
              <Input required type="datetime-local" value={toInputValue(form.start_datetime)} onChange={(e) => setForm({ ...form, start_datetime: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.calendar.endDate")}</Label>
              <Input type="datetime-local" value={toInputValue(form.end_datetime)} onChange={(e) => setForm({ ...form, end_datetime: e.target.value || null })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.calendar.location")}</Label>
              <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">{t("planning.common.responsible")}</Label>
              <Input value={form.responsible_person ?? ""} onChange={(e) => setForm({ ...form, responsible_person: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="all-day" checked={!!form.all_day} onCheckedChange={(c) => setForm({ ...form, all_day: !!c })} />
            <Label htmlFor="all-day" className="text-xs">{t("planning.calendar.allDay")}</Label>
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
