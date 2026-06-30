import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, BellOff, Check, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/i18n";
import {
  listNotifications, markNotificationRead, markAllNotificationsRead,
  getNotificationSettings, upsertNotificationSettings,
  NOTIFICATION_TYPES, type NotificationEvent, type NotificationSettings,
} from "@/lib/planning";

export function NotificationsTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeF, setTypeF] = useState("all");
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setItems(await listNotifications({
        projectId,
        unreadOnly,
        type: typeF === "all" ? undefined : typeF,
      }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("planning.common.failed"));
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId, unreadOnly, typeF]);

  async function markAll() {
    try { await markAllNotificationsRead(projectId); toast.success(t("planning.common.updated")); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
  }
  async function markOne(id: string) {
    try { await markNotificationRead(id); load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch id="unread-only" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
            <Label htmlFor="unread-only" className="text-sm">{t("planning.notifications.unreadOnly")}</Label>
          </div>
          <Select value={typeF} onValueChange={setTypeF}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("planning.common.allTypes")}</SelectItem>
              {NOTIFICATION_TYPES.map((n) => <SelectItem key={n.value} value={n.value}>{t(n.labelKey)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAll}><Check className="h-4 w-4" />{t("planning.notifications.markAllRead")}</Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}><Settings className="h-4 w-4" />{t("planning.notifications.settings")}</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <BellOff className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{t("planning.notifications.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {items.map((n) => {
            const ty = NOTIFICATION_TYPES.find((x) => x.value === n.event_type);
            const unread = n.status === "unread";
            return (
              <Card key={n.id} className={`border-border/70 ${unread ? "border-l-4 border-l-primary bg-primary/5" : ""}`}>
                <CardContent className="flex items-start justify-between gap-3 p-3">
                  <div className="flex items-start gap-3">
                    <Bell className={`mt-1 h-4 w-4 ${unread ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm ${unread ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                        {ty && <StatusBadge tone={unread ? "info" : "neutral"}>{t(ty.labelKey)}</StatusBadge>}
                      </div>
                      {n.message && <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(n.created_at)}</p>
                    </div>
                  </div>
                  {unread && <Button size="sm" variant="ghost" onClick={() => markOne(n.id)}><Check className="h-4 w-4" /></Button>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} projectId={projectId} />
    </div>
  );
}

function SettingsDialog({ open, onOpenChange, projectId }: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<NotificationSettings>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getNotificationSettings(projectId)
      .then((s) => setForm(s ?? {
        notify_deadlines: true, notify_delays: true, notify_milestones: true,
        notify_deliveries: true, notify_schedule_changes: true, notification_frequency: "immediate",
      }))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  async function onSave() {
    setSaving(true);
    try {
      await upsertNotificationSettings({ ...form, project_id: projectId } as Parameters<typeof upsertNotificationSettings>[0]);
      toast.success(t("planning.notifications.settingsSaved"));
      onOpenChange(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : t("planning.common.failed")); }
    finally { setSaving(false); }
  }

  const options = [
    { key: "notify_deadlines" as const, label: t("planning.notifications.options.deadlines") },
    { key: "notify_delays" as const, label: t("planning.notifications.options.delays") },
    { key: "notify_milestones" as const, label: t("planning.notifications.options.milestones") },
    { key: "notify_deliveries" as const, label: t("planning.notifications.options.deliveries") },
    { key: "notify_schedule_changes" as const, label: t("planning.notifications.options.scheduleChanges") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{t("planning.notifications.settings")}</DialogTitle></DialogHeader>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <div className="space-y-3">
            {options.map((o) => (
              <div key={o.key} className="flex items-center justify-between">
                <Label htmlFor={o.key} className="text-sm">{o.label}</Label>
                <Switch id={o.key} checked={!!form[o.key]} onCheckedChange={(c) => setForm({ ...form, [o.key]: c })} />
              </div>
            ))}
            <div className="space-y-1.5 pt-2">
              <Label className="text-xs">{t("planning.notifications.frequency")}</Label>
              <Select value={form.notification_frequency ?? "immediate"} onValueChange={(v) => setForm({ ...form, notification_frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">{t("planning.notifications.frequencies.immediate")}</SelectItem>
                  <SelectItem value="daily">{t("planning.notifications.frequencies.daily")}</SelectItem>
                  <SelectItem value="weekly">{t("planning.notifications.frequencies.weekly")}</SelectItem>
                  <SelectItem value="off">{t("planning.notifications.frequencies.off")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={onSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
