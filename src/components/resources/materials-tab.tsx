import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Search, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import {
  listMaterials, createMaterial, updateMaterial, deleteMaterial,
  MATERIAL_CATEGORIES, MATERIAL_UNITS, type Material,
} from "@/lib/resources";

export function MaterialsTab() {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [confirmDel, setConfirmDel] = useState<Material | null>(null);

  async function load() {
    setLoading(true);
    try { setItems(await listMaterials({ includeArchived: true })); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = items.filter((m) => {
    if (category && m.category !== category) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!m.name.toLowerCase().includes(s) && !(m.material_number ?? "").toLowerCase().includes(s) && !(m.supplier ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search materials…" className="pl-8" />
          </div>
          <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {MATERIAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />New material</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/30">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No materials yet</p>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />Add material</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-muted-foreground">{m.material_number ?? "—"}</div>
                    <h3 className="font-semibold truncate">{m.name}</h3>
                    <p className="text-xs text-muted-foreground">{m.category ?? "—"}</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium">{m.unit}</div>
                    {m.default_price != null && <div className="text-muted-foreground">€{Number(m.default_price).toFixed(2)}</div>}
                  </div>
                </div>
                {m.supplier && <div className="text-xs text-muted-foreground">Supplier: {m.supplier}</div>}
                {m.minimum_stock != null && <div className="text-xs text-muted-foreground">Min stock: {m.minimum_stock} {m.unit}</div>}
                <div className="flex gap-1 pt-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}><Edit className="h-3.5 w-3.5" />Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDel(m)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MaterialDialog open={open} onOpenChange={setOpen} editing={editing} onSaved={load} />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete material?</AlertDialogTitle><AlertDialogDescription>Linked stock and usage may be removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              if (!confirmDel) return;
              try { await deleteMaterial(confirmDel.id); toast.success("Deleted"); setConfirmDel(null); load(); }
              catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MaterialDialog({ open, onOpenChange, editing, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; editing: Material | null; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Material>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setForm(editing ?? { unit: "pcs", archived: false }); }, [open, editing]);
  function set<K extends keyof Material>(k: K, v: Material[K] | null) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (editing) await updateMaterial(editing.id, form);
      else await createMaterial(form as never);
      toast.success("Saved"); onOpenChange(false); onSaved();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{editing ? "Edit material" : "New material"}</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name *"><Input required value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Material number"><Input value={form.material_number ?? ""} onChange={(e) => set("material_number", e.target.value)} /></Field>
            <Field label="Category">
              <Select value={form.category ?? ""} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{MATERIAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Unit *">
              <Select value={form.unit ?? "pcs"} onValueChange={(v) => set("unit", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MATERIAL_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Supplier"><Input value={form.supplier ?? ""} onChange={(e) => set("supplier", e.target.value)} /></Field>
            <Field label="Default price (€)"><Input type="number" step="0.01" value={form.default_price ?? ""} onChange={(e) => set("default_price", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Minimum stock"><Input type="number" step="0.001" value={form.minimum_stock ?? ""} onChange={(e) => set("minimum_stock", e.target.value ? Number(e.target.value) : null)} /></Field>
          </div>
          <Field label="Notes"><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>
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
