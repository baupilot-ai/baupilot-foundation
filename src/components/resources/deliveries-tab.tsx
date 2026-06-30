import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Truck, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import {
  listDeliveries, createDelivery, updateDelivery, deleteDelivery, addDeliveryItem, deleteDeliveryItem,
  DELIVERY_STATUS, statusMeta, listMaterials,
  type DeliveryWithItems, type Material,
} from "@/lib/resources";
import { listProjects, type ProjectRow } from "@/lib/projects";

export function DeliveriesTab({ projectId }: { projectId?: string } = {}) {
  const [items, setItems] = useState<DeliveryWithItems[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [supplier, setSupplier] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryWithItems | null>(null);
  const [confirmDel, setConfirmDel] = useState<DeliveryWithItems | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [d, p, m] = await Promise.all([
        listDeliveries(projectId ? { projectId } : undefined),
        projectId ? Promise.resolve([] as ProjectRow[]) : listProjects({ archived: false }),
        listMaterials(),
      ]);
      setItems(d); setProjects(p); setMaterials(m);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = items.filter((d) => {
    if (status && d.status !== status) return false;
    if (supplier && !((d.supplier ?? "").toLowerCase().includes(supplier.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input placeholder="Filter by supplier…" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="flex-1 min-w-[160px]" />
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {DELIVERY_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />New delivery</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Truck className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No deliveries yet</p>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Create delivery</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((d) => {
            const sm = statusMeta(DELIVERY_STATUS, d.status);
            const proj = projects.find((p) => p.id === d.project_id);
            return (
              <Card key={d.id} className="border-border/70">
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-3">
                  <div className="min-w-0">
                    <CardTitle className="text-base flex flex-wrap items-center gap-2">
                      <span>{d.supplier ?? "Supplier"}</span>
                      <StatusBadge tone={sm.tone}>{sm.label}</StatusBadge>
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.delivery_number && <span className="font-mono mr-2">#{d.delivery_number}</span>}
                      {d.delivery_date && <span>{new Date(d.delivery_date).toLocaleDateString()}</span>}
                      {d.delivery_time && <span> · {d.delivery_time.slice(0, 5)}</span>}
                      {proj && <span> · {proj.name}</span>}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {d.status !== "received" && (
                      <Button size="sm" variant="outline" onClick={async () => {
                        try { await updateDelivery(d.id, { status: "received" }); toast.success("Marked received"); load(); }
                        catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                      }}><CheckCircle2 className="h-3.5 w-3.5" />Receive</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(d); setOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDel(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {(d.items ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No items.</p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {(d.items ?? []).map((it) => {
                        const mat = materials.find((m) => m.id === it.material_id);
                        return (
                          <li key={it.id} className="flex flex-wrap justify-between gap-2">
                            <span>{mat?.name ?? it.description ?? "Item"}</span>
                            <span className="font-mono text-muted-foreground">{it.quantity} {it.unit ?? mat?.unit ?? ""}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {d.notes && <p className="mt-2 text-xs text-muted-foreground">{d.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DeliveryDialog
        open={open} onOpenChange={setOpen}
        editing={editing} projects={projects} materials={materials}
        defaultProjectId={projectId}
        onSaved={load}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete delivery?</AlertDialogTitle><AlertDialogDescription>Items will also be removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              if (!confirmDel) return;
              try { await deleteDelivery(confirmDel.id); toast.success("Deleted"); setConfirmDel(null); load(); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type ItemDraft = { id?: string; material_id?: string | null; description?: string; quantity: number; unit?: string };

function DeliveryDialog({ open, onOpenChange, editing, projects, materials, defaultProjectId, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  editing: DeliveryWithItems | null;
  projects: ProjectRow[]; materials: Material[];
  defaultProjectId?: string; onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<DeliveryWithItems>>({});
  const [drafts, setDrafts] = useState<ItemDraft[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ?? {
        status: "expected",
        project_id: defaultProjectId ?? null,
        delivery_date: new Date().toISOString().slice(0, 10),
      });
      setDrafts((editing?.items ?? []).map((i) => ({
        id: i.id, material_id: i.material_id, description: i.description ?? "",
        quantity: Number(i.quantity), unit: i.unit ?? undefined,
      })));
    }
  }, [open, editing, defaultProjectId]);

  function set<K extends keyof DeliveryWithItems>(k: K, v: DeliveryWithItems[K] | null) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateDelivery(editing.id, form);
        // sync items: delete removed, insert new
        const existingIds = new Set((editing.items ?? []).map((i) => i.id));
        const keepIds = new Set(drafts.filter((d) => d.id).map((d) => d.id!));
        for (const id of existingIds) if (!keepIds.has(id)) await deleteDeliveryItem(id);
        for (const d of drafts) {
          if (!d.id) {
            await addDeliveryItem({
              delivery_id: editing.id, material_id: d.material_id ?? null,
              description: d.description ?? null, quantity: d.quantity, unit: d.unit ?? null,
            } as never);
          }
        }
        toast.success("Updated");
      } else {
        await createDelivery(form as never, drafts.map((d) => ({
          material_id: d.material_id ?? null, description: d.description ?? null,
          quantity: d.quantity, unit: d.unit ?? null,
        })) as never);
        toast.success("Created");
      }
      onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? "Edit delivery" : "New delivery"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Supplier"><Input value={form.supplier ?? ""} onChange={(e) => set("supplier", e.target.value)} /></Field>
            <Field label="Delivery number"><Input value={form.delivery_number ?? ""} onChange={(e) => set("delivery_number", e.target.value)} /></Field>
            <Field label="Date"><Input type="date" value={form.delivery_date ?? ""} onChange={(e) => set("delivery_date", e.target.value)} /></Field>
            <Field label="Time"><Input type="time" value={form.delivery_time ?? ""} onChange={(e) => set("delivery_time", e.target.value)} /></Field>
            <Field label="Status">
              <Select value={form.status ?? "expected"} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DELIVERY_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Project">
              <Select value={form.project_id ?? "none"} onValueChange={(v) => set("project_id", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="No project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Received by"><Input value={form.received_by ?? ""} onChange={(e) => set("received_by", e.target.value)} /></Field>
          </div>
          <Field label="Notes"><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Items</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => setDrafts((d) => [...d, { quantity: 0 }])}>
                <Plus className="h-3.5 w-3.5" />Add item
              </Button>
            </div>
            {drafts.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 rounded border border-border/70 p-2">
                <div className="col-span-12 sm:col-span-5">
                  <Select value={it.material_id ?? "free"} onValueChange={(v) => setDrafts((arr) => arr.map((d, i) => i === idx ? { ...d, material_id: v === "free" ? null : v } : d))}>
                    <SelectTrigger><SelectValue placeholder="Material" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free-text item</SelectItem>
                      {materials.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input className="col-span-12 sm:col-span-4" placeholder="Description" value={it.description ?? ""} onChange={(e) => setDrafts((arr) => arr.map((d, i) => i === idx ? { ...d, description: e.target.value } : d))} />
                <Input className="col-span-7 sm:col-span-2" type="number" step="0.001" placeholder="Qty" value={it.quantity || ""} onChange={(e) => setDrafts((arr) => arr.map((d, i) => i === idx ? { ...d, quantity: Number(e.target.value) } : d))} />
                <Button type="button" size="icon" variant="ghost" className="col-span-5 sm:col-span-1" onClick={() => setDrafts((arr) => arr.filter((_, i) => i !== idx))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
