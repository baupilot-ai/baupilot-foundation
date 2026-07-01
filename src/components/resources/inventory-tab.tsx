import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Warehouse, ArrowUpDown, AlertTriangle, MoveRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import {
  listInventoryLocations, createInventoryLocation, updateInventoryLocation, deleteInventoryLocation,
  listStock, adjustStock, moveStock, listMaterials,
  LOCATION_TYPES, type InventoryLocation, type Material, type StockRow,
} from "@/lib/resources";

export function InventoryTab() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [stock, setStock] = useState<StockRow[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [locOpen, setLocOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<InventoryLocation | null>(null);
  const [adjustOpen, setAdjustOpen] = useState<{ mode: "add" | "remove" | "move" } | null>(null);
  const [confirmDelLoc, setConfirmDelLoc] = useState<InventoryLocation | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [l, s, m] = await Promise.all([listInventoryLocations(), listStock(), listMaterials()]);
      setLocations(l); setStock(s); setMaterials(m);
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const stockByMat = new Map<string, number>();
  for (const r of stock) stockByMat.set(r.material_id, (stockByMat.get(r.material_id) ?? 0) + Number(r.quantity));
  const lowStock = materials.filter((m) => m.minimum_stock != null && Number(m.minimum_stock) > 0 && (stockByMat.get(m.id) ?? 0) < Number(m.minimum_stock));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{t("resources.labels.inventoryLocations")}</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAdjustOpen({ mode: "add" })}><Plus className="h-4 w-4" />{t("resources.actions.addStock")}</Button>
          <Button variant="outline" onClick={() => setAdjustOpen({ mode: "remove" })}><ArrowUpDown className="h-4 w-4" />{t("resources.actions.reduce")}</Button>
          <Button variant="outline" onClick={() => setAdjustOpen({ mode: "move" })}><MoveRight className="h-4 w-4" />{t("resources.actions.move")}</Button>
          <Button onClick={() => { setEditingLoc(null); setLocOpen(true); }}><Plus className="h-4 w-4" />{t("resources.actions.newLocation")}</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {lowStock.length > 0 && (
            <Card className="border-warning/40 bg-warning/5">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />{t("resources.warnings.lowStock")}</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {lowStock.map((m) => (
                  <div key={m.id} className="flex justify-between text-sm">
                    <span>{m.name}</span>
                    <span className="text-muted-foreground">{stockByMat.get(m.id) ?? 0} / {t("resources.warnings.minShort")} {m.minimum_stock} {m.unit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {locations.length === 0 ? (
            <Card className="border-dashed border-border/70 bg-muted/30">
              <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <Warehouse className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">{t("resources.empty.locations")}</p>
                <Button onClick={() => { setEditingLoc(null); setLocOpen(true); }}><Plus className="h-4 w-4" />{t("resources.actions.addLocation")}</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {locations.map((loc) => {
                const rows = stock.filter((s) => s.location_id === loc.id);
                return (
                  <Card key={loc.id} className="border-border/70">
                    <CardHeader className="flex flex-row items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{loc.name}</CardTitle>
                        {loc.location_type && <StatusBadge tone="neutral">{t(`resources.locationTypes.${loc.location_type}`, loc.location_type)}</StatusBadge>}
                        {loc.address && <p className="mt-1 text-xs text-muted-foreground">{loc.address}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditingLoc(loc); setLocOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setConfirmDelLoc(loc)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {rows.length === 0 ? (
                        <p className="text-xs text-muted-foreground">{t("resources.empty.noStock")}</p>
                      ) : (
                        <ul className="space-y-1 text-sm">
                          {rows.map((r) => (
                            <li key={r.id} className="flex justify-between">
                              <span>{r.material?.name ?? t("resources.labels.materialFallback")}</span>
                              <span className="font-mono">{r.quantity} {r.material?.unit ?? r.unit ?? ""}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <LocationDialog open={locOpen} onOpenChange={setLocOpen} editing={editingLoc} onSaved={load} />
      <AdjustDialog
        mode={adjustOpen?.mode}
        materials={materials} locations={locations}
        onClose={() => setAdjustOpen(null)} onSaved={load}
      />

      <AlertDialog open={!!confirmDelLoc} onOpenChange={(o) => !o && setConfirmDelLoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t("resources.dialogs.deleteLocation")}</AlertDialogTitle><AlertDialogDescription>{t("resources.dialogs.deleteLocationDesc")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              if (!confirmDelLoc) return;
              try { await deleteInventoryLocation(confirmDelLoc.id); toast.success(t("states.deleted")); setConfirmDelLoc(null); load(); }
              catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
            }}>{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LocationDialog({ open, onOpenChange, editing, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; editing: InventoryLocation | null; onSaved: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Partial<InventoryLocation>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(editing ?? {}); }, [open, editing]);
  function set<K extends keyof InventoryLocation>(k: K, v: InventoryLocation[K] | null) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? t("resources.dialogs.editLocation") : t("resources.dialogs.newLocation")}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          if (!form.name) { toast.error(t("states.nameRequired")); return; }
          setSaving(true);
          try {
            if (editing) await updateInventoryLocation(editing.id, form);
            else await createInventoryLocation(form as never);
            toast.success(t("states.saved")); onOpenChange(false); onSaved();
          } catch (err) { toast.error(err instanceof Error ? err.message : t("states.failed")); }
          finally { setSaving(false); }
        }}>
          <Field label={`${t("resources.fields.name")} *`}><Input required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label={t("resources.fields.type")}>
            <Select value={form.location_type ?? ""} onValueChange={(v) => set("location_type", v)}>
              <SelectTrigger><SelectValue placeholder={t("resources.empty.select")} /></SelectTrigger>
              <SelectContent>{LOCATION_TYPES.map((lt) => <SelectItem key={lt} value={lt}>{t(`resources.locationTypes.${lt}`, lt)}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={t("resources.fields.address")}><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdjustDialog({ mode, materials, locations, onClose, onSaved }: {
  mode?: "add" | "remove" | "move";
  materials: Material[]; locations: InventoryLocation[];
  onClose: () => void; onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [materialId, setMaterialId] = useState("");
  const [locId, setLocId] = useState("");
  const [toLocId, setToLocId] = useState("");
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (mode) { setMaterialId(""); setLocId(""); setToLocId(""); setQty(""); } }, [mode]);

  if (!mode) return null;
  const title = mode === "add" ? t("resources.dialogs.addStock") : mode === "remove" ? t("resources.dialogs.reduceStock") : t("resources.dialogs.moveStock");

  return (
    <Dialog open={!!mode} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label={t("resources.fields.for") + " " + t("resources.labels.materialFallback")}>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger><SelectValue placeholder={t("resources.search.material")} /></SelectTrigger>
              <SelectContent>{materials.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={mode === "move" ? t("resources.fields.fromLocation") : t("resources.fields.location")}>
            <Select value={locId} onValueChange={setLocId}>
              <SelectTrigger><SelectValue placeholder={t("resources.search.location")} /></SelectTrigger>
              <SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          {mode === "move" && (
            <Field label={t("resources.fields.toLocation")}>
              <Select value={toLocId} onValueChange={setToLocId}>
                <SelectTrigger><SelectValue placeholder={t("resources.search.destination")} /></SelectTrigger>
                <SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}
          <Field label={t("resources.fields.quantity")}><Input type="number" step="0.001" value={qty} onChange={(e) => setQty(e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{t("common.cancel")}</Button>
          <Button disabled={saving} onClick={async () => {
            const n = Number(qty);
            if (!materialId || !locId || !n) { toast.error(t("states.fillAllFields")); return; }
            if (mode === "move" && !toLocId) { toast.error(t("states.fillAllFields")); return; }
            setSaving(true);
            try {
              if (mode === "add") await adjustStock(materialId, locId, n);
              else if (mode === "remove") await adjustStock(materialId, locId, -n);
              else await moveStock(materialId, locId, toLocId, n);
              toast.success(t("states.saved")); onClose(); onSaved();
            } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
            finally { setSaving(false); }
          }}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
