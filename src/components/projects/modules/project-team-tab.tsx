import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2, Users2, Building2, UserSquare, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ContactCard } from "@/components/team/contact-card";

import {
  listEmployees, listSubcontractors, listProjectContacts, listProjectTeam,
  addProjectTeamMember, removeProjectTeamMember,
  PROJECT_ROLES, CONTACT_TYPES, TRADES, labelOf, fullName,
  type Employee, type Subcontractor, type ExternalContact, type ProjectTeamMember, type PersonType,
} from "@/lib/team";

export function ProjectTeamTab({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<ProjectTeamMember[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [subs, setSubs] = useState<Subcontractor[]>([]);
  const [contacts, setContacts] = useState<ExternalContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [m, e, s, c] = await Promise.all([
        listProjectTeam(projectId),
        listEmployees(),
        listSubcontractors(),
        listProjectContacts(projectId),
      ]);
      setMembers(m); setEmployees(e); setSubs(s); setContacts(c);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [projectId]);

  const empMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);
  const subMap = useMemo(() => new Map(subs.map((s) => [s.id, s])), [subs]);
  const ctMap = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);

  const grouped = useMemo(() => ({
    employee: members.filter((m) => m.person_type === "employee"),
    subcontractor: members.filter((m) => m.person_type === "subcontractor"),
    external_contact: members.filter((m) => m.person_type === "external_contact"),
  }), [members]);

  async function onRemove(id: string) {
    try { await removeProjectTeamMember(id); toast.success("Removed from project"); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {grouped.employee.length} employees · {grouped.subcontractor.length} subcontractors · {grouped.external_contact.length} contacts
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add to team</Button>
      </div>

      <Section icon={Users2} title="Internal employees" empty="No employees assigned to this project yet.">
        {grouped.employee.map((m) => {
          const e = m.employee_id ? empMap.get(m.employee_id) : null;
          return (
            <ContactCard
              key={m.id}
              title={e ? fullName(e) : "Removed employee"}
              subtitle={`${labelOf(PROJECT_ROLES, m.project_role)}${e?.trade ? ` · ${labelOf(TRADES, e.trade)}` : ""}`}
              email={e?.email}
              phone={e?.phone}
              status={{ label: m.status === "active" ? "Active" : "Inactive", tone: m.status === "active" ? "success" : "neutral" }}
              onDelete={() => onRemove(m.id)}
              deleteLabel="Remove from project"
            />
          );
        })}
      </Section>

      <Section icon={Building2} title="Subcontractors" empty="No subcontractors assigned to this project yet.">
        {grouped.subcontractor.map((m) => {
          const s = m.subcontractor_id ? subMap.get(m.subcontractor_id) : null;
          return (
            <ContactCard
              key={m.id}
              title={s?.company_name ?? "Removed subcontractor"}
              subtitle={`${labelOf(PROJECT_ROLES, m.project_role)}${s?.trade ? ` · ${labelOf(TRADES, s.trade)}` : ""}`}
              email={s?.email}
              phone={s?.phone}
              status={{ label: m.status === "active" ? "Active" : "Inactive", tone: m.status === "active" ? "success" : "neutral" }}
              onDelete={() => onRemove(m.id)}
              deleteLabel="Remove from project"
            />
          );
        })}
      </Section>

      <Section icon={UserSquare} title="External contacts on team" empty="External project contacts can be added below.">
        {grouped.external_contact.map((m) => {
          const c = m.external_contact_id ? ctMap.get(m.external_contact_id) : null;
          return (
            <ContactCard
              key={m.id}
              title={c ? (fullName(c) || c.company_name || c.email || "Contact") : "Removed contact"}
              subtitle={`${labelOf(PROJECT_ROLES, m.project_role)}${c ? ` · ${labelOf(CONTACT_TYPES, c.contact_type)}` : ""}`}
              email={c?.email}
              phone={c?.phone}
              status={{ label: m.status === "active" ? "Active" : "Inactive", tone: m.status === "active" ? "success" : "neutral" }}
              onDelete={() => onRemove(m.id)}
              deleteLabel="Remove from project"
            />
          );
        })}
      </Section>

      <AddTeamMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        projectId={projectId}
        employees={employees}
        subs={subs}
        contacts={contacts}
        onSaved={load}
      />
    </div>
  );
}

function Section({
  icon: Icon, title, empty, children,
}: { icon: React.ComponentType<{ className?: string }>; title: string; empty: string; children: React.ReactNode }) {
  const arr = Array.isArray(children) ? children : [children];
  const hasItems = arr.filter(Boolean).length > 0;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />{title}
      </div>
      {hasItems ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      ) : (
        <Card className="border-dashed border-border/70"><CardContent className="py-6 text-center text-sm text-muted-foreground">{empty}</CardContent></Card>
      )}
    </div>
  );
}

function AddTeamMemberDialog({
  open, onOpenChange, projectId, employees, subs, contacts, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  employees: Employee[];
  subs: Subcontractor[];
  contacts: ExternalContact[];
  onSaved: () => void;
}) {
  const [personType, setPersonType] = useState<PersonType>("employee");
  const [personId, setPersonId] = useState<string>("");
  const [role, setRole] = useState<string>("worker");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setPersonType("employee"); setPersonId(""); setRole("worker");
      setStart(""); setEnd(""); setNotes("");
    }
  }, [open]);

  const options = personType === "employee" ? employees.map((e) => ({ id: e.id, label: fullName(e) || "Unnamed" }))
    : personType === "subcontractor" ? subs.map((s) => ({ id: s.id, label: s.company_name }))
    : contacts.map((c) => ({ id: c.id, label: fullName(c) || c.company_name || c.email || "Contact" }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!personId) { toast.error("Select a person"); return; }
    setSaving(true);
    try {
      await addProjectTeamMember({
        project_id: projectId,
        person_type: personType,
        employee_id: personType === "employee" ? personId : null,
        subcontractor_id: personType === "subcontractor" ? personId : null,
        external_contact_id: personType === "external_contact" ? personId : null,
        project_role: role,
        start_date: start || null,
        end_date: end || null,
        status: "active",
        notes: notes || null,
      });
      toast.success("Added to project team");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add to project team</DialogTitle>
          <DialogDescription>Assign an employee, subcontractor or contact.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={personType} onValueChange={(v) => { setPersonType(v as PersonType); setPersonId(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                <SelectItem value="external_contact">External contact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Person / company *</Label>
            {options.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No {personType === "external_contact" ? "contacts" : `${personType}s`} yet.
                {personType !== "external_contact" && " Add them in the Team page first."}
              </div>
            ) : (
              <Select value={personId} onValueChange={setPersonId}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Project role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROJECT_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}><X className="h-4 w-4" />Cancel</Button>
            <Button type="submit" disabled={saving || !personId}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Add to team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
