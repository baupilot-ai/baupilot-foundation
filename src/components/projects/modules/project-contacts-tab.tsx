import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContactCard } from "@/components/team/contact-card";

import {
  listProjectContacts, createContact, updateContact, deleteContact,
  CONTACT_TYPES, labelOf, fullName, type ExternalContact,
} from "@/lib/team";

export function ProjectContactsTab({ projectId }: { projectId: string }) {
  const [rows, setRows] = useState<ExternalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [dialog, setDialog] = useState<{ open: boolean; row: ExternalContact | null }>({ open: false, row: null });
  const [confirmDel, setConfirmDel] = useState<ExternalContact | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await listProjectContacts(projectId)); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (type !== "all" && r.contact_type !== type) return false;
      if (!qq) return true;
      return [r.first_name, r.last_name, r.company_name, r.email, r.phone, r.role_description]
        .filter(Boolean).join(" ").toLowerCase().includes(qq);
    });
  }, [rows, q, type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search contacts…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {CONTACT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setDialog({ open: true, row: null })}><Plus className="h-4 w-4" />Add contact</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {rows.length === 0 ? "No contacts on this project yet." : "No matches."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ContactCard
              key={c.id}
              title={fullName(c) || c.company_name || c.email || "Contact"}
              subtitle={`${labelOf(CONTACT_TYPES, c.contact_type)}${c.company_name && fullName(c) ? ` · ${c.company_name}` : ""}${c.role_description ? ` · ${c.role_description}` : ""}`}
              email={c.email}
              phone={c.phone}
              onEdit={() => setDialog({ open: true, row: c })}
              onDelete={() => setConfirmDel(c)}
              deleteLabel="Delete contact"
            />
          ))}
        </div>
      )}

      <ContactDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        projectId={projectId}
        contact={dialog.row}
        onSaved={load}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the contact from the project.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteContact(confirmDel.id); toast.success("Deleted"); await load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
                finally { setConfirmDel(null); }
              }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const emptyForm = {
  contact_type: "client",
  first_name: "", last_name: "", company_name: "",
  email: "", phone: "", role_description: "", address: "", notes: "",
};

function ContactDialog({
  open, onOpenChange, projectId, contact, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  contact: ExternalContact | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setForm({
        contact_type: contact.contact_type,
        first_name: contact.first_name ?? "",
        last_name: contact.last_name ?? "",
        company_name: contact.company_name ?? "",
        email: contact.email ?? "",
        phone: contact.phone ?? "",
        role_description: contact.role_description ?? "",
        address: contact.address ?? "",
        notes: contact.notes ?? "",
      });
    } else setForm(emptyForm);
  }, [contact, open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        project_id: projectId,
        contact_type: form.contact_type,
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        company_name: form.company_name || null,
        email: form.email || null,
        phone: form.phone || null,
        role_description: form.role_description || null,
        address: form.address || null,
        notes: form.notes || null,
      };
      if (contact) await updateContact(contact.id, payload);
      else await createContact(payload);
      toast.success(contact ? "Contact updated" : "Contact added");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
          <DialogDescription>External people involved in this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Contact type</Label>
            <Select value={form.contact_type} onValueChange={(v) => setForm({ ...form, contact_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTACT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>First name</Label>
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Last name</Label>
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Company / organization</Label>
            <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Role / position</Label>
            <Input value={form.role_description} onChange={(e) => setForm({ ...form, role_description: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}><X className="h-4 w-4" />Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}{contact ? "Save" : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
