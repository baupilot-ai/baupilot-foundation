import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  listMaterialUsage, createMaterialUsage, deleteMaterialUsage,
  listMaterials, listDeliveries, type Material, type DeliveryWithItems,
} from "@/lib/resources";

export function ProjectMaterialsTab({ projectId }: { projectId: string }) {
  const [usage, setUsage] = useState<Awaited<ReturnType<typeof listMaterialUsage>>>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<DeliveryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [u, m, d] = await Promise.all([
        listMaterialUsage(projectId),
        listMaterials(),
        listDeliveries({ projectId }),
      ]);
      setUsage(u); setMaterials(m); setRecentDeliveries(d.slice(0, 5));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [projectId]);

  // Totals per material
  const totals = new Map<string, number>();
  for (const u of usage) totals.set(u.material_id, (totals.get(u.material_id) ?? 0) + Number(u.quantity));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Materials used on this project</h3>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Log usage</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {totals.size > 0 && (
            <Card className="border-border/70">
              <CardHeader><CardTitle className="text-base">Totals used</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {[...totals.entries()].map(([mid, qty]) => {
                    const mat = materials.find((m) => m.id === mid);
                    return (
                      <li key={mid} className="flex justify-between">
                        <span>{mat?.name ?? "Material"}</span>
                        <span className="font-mono">{qty} {mat?.unit}</span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {usage.length === 0 ? (
            <Card className="border-dashed border-border/70 bg-muted/30">
              <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <Package className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No usage logged yet</p>
                <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Log usage</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {usage.map((u) => (
                <Card key={u.id} className="border-border/70">
                  <CardContent className="p-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{u.material?.name ?? "Material"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(u.usage_date).toLocaleDateString()}
                        {u.used_by && <> · {u.used_by}</>}
                      </div>
                      {u.notes && <div className="mt-1 text-sm text-muted-foreground">{u.notes}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{u.quantity} {u.unit ?? u.material?.unit}</span>
                      <Button size="icon" variant="ghost" onClick={async () => {
                        try { await deleteMaterialUsage(u.id); toast.success("Removed"); load(); }
                        catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                      }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {recentDeliveries.length > 0 && (
            <Card className="border-border/70">
              <CardHeader><CardTitle className="text-base">Recent deliveries</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {recentDeliveries.map((d) => (
                    <li key={d.id} className="flex justify-between">
                      <span>{d.supplier ?? "Supplier"}</span>
                      <span className="text-muted-foreground">{d.delivery_date ? new Date(d.delivery_date).toLocaleDateString() : "—"} · {d.status}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <UsageDialog open={open} onOpenChange={setOpen} projectId={projectId} materials={materials} onSaved={load} />
    </div>
  );
}

function UsageDialog({ open, onOpenChange, projectId, materials, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  projectId: string; materials: Material[]; onSaved: () => void;
}) {
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [usageDate, setUsageDate] = useState(new Date().toISOString().slice(0, 10));
  const [usedBy, setUsedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMaterialId(""); setQuantity(""); setUnit("");
      setUsageDate(new Date().toISOString().slice(0, 10)); setUsedBy(""); setNotes("");
    }
  }, [open]);

  useEffect(() => {
    const m = materials.find((x) => x.id === materialId);
    if (m) setUnit(m.unit);
  }, [materialId, materials]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Log material usage</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          if (!materialId || !quantity) { toast.error("Material & quantity required"); return; }
          setSaving(true);
          try {
            await createMaterialUsage({
              project_id: projectId, material_id: materialId, quantity: Number(quantity),
              unit: unit || null, usage_date: usageDate, used_by: usedBy || null, notes: notes || null,
            } as never);
            toast.success("Logged"); onOpenChange(false); onSaved();
          } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
          finally { setSaving(false); }
        }}>
          <Field label="Material *">
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
              <SelectContent>{materials.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Quantity *"><Input type="number" step="0.001" required value={quantity} onChange={(e) => setQuantity(e.target.value)} /></Field>
            <Field label="Unit"><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date"><Input type="date" value={usageDate} onChange={(e) => setUsageDate(e.target.value)} /></Field>
            <Field label="Used by"><Input value={usedBy} onChange={(e) => setUsedBy(e.target.value)} /></Field>
          </div>
          <Field label="Notes"><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
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
