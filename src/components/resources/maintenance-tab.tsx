import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { listMaintenance, createMaintenance, deleteMaintenance, listEquipment, listTools, type Equipment, type Tool } from "@/lib/resources";

export function MaintenanceTab() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("de") ? "de-DE" : "en-US";
  const [items, setItems] = useState<Awaited<ReturnType<typeof listMaintenance>>>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [m, eq, tl] = await Promise.all([listMaintenance(), listEquipment(), listTools()]);
      setItems(m); setEquipment(eq); setTools(tl);
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("resources.labels.maintenanceRecords")}</h3>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />{t("resources.actions.addRecord")}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Wrench className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">{t("resources.empty.maintenance")}</p>
            <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />{t("resources.actions.addRecord")}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((m) => {
            const eq = equipment.find((e) => e.id === m.equipment_id);
            const tl = tools.find((tt) => tt.id === m.tool_id);
            return (
              <Card key={m.id} className="border-border/70">
                <CardContent className="p-4 space-y-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold">{m.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {eq ? `${t("resources.fields.equipment")}: ${eq.name}` : tl ? `${t("resources.fields.tool")}: ${tl.name}` : "—"} ·{" "}
                        {t(`resources.recordTypes.${m.record_type}`, m.record_type)} · {m.performed_date ? new Date(m.performed_date).toLocaleDateString(locale) : "—"}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <StatusBadge tone={m.status === "completed" ? "success" : "info"}>{t(`resources.maintenanceStatus.${m.status}`, m.status)}</StatusBadge>
                      <Button size="icon" variant="ghost" onClick={async () => {
                        try { await deleteMaintenance(m.id); toast.success(t("states.deleted")); load(); }
                        catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
                      }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                  {m.description && <p className="text-sm">{m.description}</p>}
                  <div className="text-xs text-muted-foreground">
                    {m.performed_by && <>{t("resources.labels.byPrefix")} {m.performed_by} · </>}
                    {m.cost != null && <>€{Number(m.cost).toFixed(2)} · </>}
                    {m.next_due_date && <>{t("resources.fields.nextDue")}: {new Date(m.next_due_date).toLocaleDateString(locale)}</>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <MaintenanceDialog open={open} onOpenChange={setOpen} equipment={equipment} tools={tools} onSaved={load} />
    </div>
  );
}

function MaintenanceDialog({ open, onOpenChange, equipment, tools, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  equipment: Equipment[]; tools: Tool[]; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<{
    title: string; record_type: string; description?: string;
    performed_date?: string; next_due_date?: string; performed_by?: string;
    cost?: number; status: string; equipment_id?: string | null; tool_id?: string | null;
  }>({ title: "", record_type: "maintenance", status: "completed" });
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState<"equipment" | "tool">("equipment");

  useEffect(() => {
    if (open) { setForm({ title: "", record_type: "maintenance", status: "completed", performed_date: new Date().toISOString().slice(0, 10) }); setTarget("equipment"); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{t("resources.dialogs.newMaintenance")}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          if (!form.title) { toast.error(t("states.titleRequired")); return; }
          if (target === "equipment" && !form.equipment_id) { toast.error(t("states.fillAllFields")); return; }
          if (target === "tool" && !form.tool_id) { toast.error(t("states.fillAllFields")); return; }
          setSaving(true);
          try {
            await createMaintenance({
              title: form.title, record_type: form.record_type, description: form.description ?? null,
              performed_date: form.performed_date ?? null, next_due_date: form.next_due_date ?? null,
              performed_by: form.performed_by ?? null, cost: form.cost ?? null, status: form.status,
              equipment_id: target === "equipment" ? form.equipment_id ?? null : null,
              tool_id: target === "tool" ? form.tool_id ?? null : null,
            } as never);
            toast.success(t("states.saved")); onOpenChange(false); onSaved();
          } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
          finally { setSaving(false); }
        }}>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("resources.fields.for")}>
              <Select value={target} onValueChange={(v) => setTarget(v as never)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">{t("resources.fields.equipment")}</SelectItem>
                  <SelectItem value="tool">{t("resources.fields.tool")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={target === "equipment" ? t("resources.fields.equipment") : t("resources.fields.tool")}>
              {target === "equipment" ? (
                <Select value={form.equipment_id ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, equipment_id: v }))}>
                  <SelectTrigger><SelectValue placeholder={t("resources.empty.select")} /></SelectTrigger>
                  <SelectContent>{equipment.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Select value={form.tool_id ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, tool_id: v }))}>
                  <SelectTrigger><SelectValue placeholder={t("resources.empty.select")} /></SelectTrigger>
                  <SelectContent>{tools.map((tt) => <SelectItem key={tt.id} value={tt.id}>{tt.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </Field>
          </div>
          <Field label={`${t("resources.fields.name")} *`}><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("resources.fields.recordType")}>
              <Select value={form.record_type} onValueChange={(v) => setForm((f) => ({ ...f, record_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">{t("resources.recordTypes.maintenance")}</SelectItem>
                  <SelectItem value="inspection">{t("resources.recordTypes.inspection")}</SelectItem>
                  <SelectItem value="repair">{t("resources.recordTypes.repair")}</SelectItem>
                  <SelectItem value="service">{t("resources.recordTypes.service")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("resources.fields.status")}>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">{t("resources.maintenanceStatus.scheduled")}</SelectItem>
                  <SelectItem value="in_progress">{t("resources.maintenanceStatus.in_progress")}</SelectItem>
                  <SelectItem value="completed">{t("resources.maintenanceStatus.completed")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("resources.fields.performedDate")}><Input type="date" value={form.performed_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, performed_date: e.target.value }))} /></Field>
            <Field label={t("resources.fields.nextDue")}><Input type="date" value={form.next_due_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, next_due_date: e.target.value }))} /></Field>
            <Field label={t("resources.fields.performedBy")}><Input value={form.performed_by ?? ""} onChange={(e) => setForm((f) => ({ ...f, performed_by: e.target.value }))} /></Field>
            <Field label={t("resources.fields.cost")}><Input type="number" step="0.01" value={form.cost ?? ""} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value ? Number(e.target.value) : undefined }))} /></Field>
          </div>
          <Field label={t("resources.fields.description")}><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
