import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Users2, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  EMPLOYEE_ROLES, TRADES, EMPLOYEE_STATUS, SUBCONTRACTOR_STATUS, QUALIFICATION_STATUS, labelOf, fullName,
  listEmployees, deleteEmployee,
  listSubcontractors, deleteSubcontractor,
  type Employee, type Subcontractor,
} from "@/lib/team";
import { EmployeeDialog } from "@/components/team/employee-dialog";
import { SubcontractorDialog } from "@/components/team/subcontractor-dialog";
import { ContactCard } from "@/components/team/contact-card";

export const Route = createFileRoute("/_app/team")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Team — BauPilot AI" },
      { name: "description", content: "Manage employees and subcontractors." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const [tab, setTab] = useState<"employees" | "subcontractors">("employees");
  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Employees, subcontractors and the people who get your projects built." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as "employees" | "subcontractors")}>
        <TabsList>
          <TabsTrigger value="employees"><Users2 className="h-4 w-4" />Employees</TabsTrigger>
          <TabsTrigger value="subcontractors"><Building2 className="h-4 w-4" />Subcontractors</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="mt-4"><EmployeesPanel /></TabsContent>
        <TabsContent value="subcontractors" className="mt-4"><SubcontractorsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function EmployeesPanel() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("all");
  const [trade, setTrade] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [dialog, setDialog] = useState<{ open: boolean; row: Employee | null }>({ open: false, row: null });
  const [confirmDel, setConfirmDel] = useState<Employee | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await listEmployees()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (role !== "all" && r.role !== role) return false;
      if (trade !== "all" && r.trade !== trade) return false;
      if (status !== "all" && r.status !== status) return false;
      if (!qq) return true;
      return [r.first_name, r.last_name, r.email, r.phone, r.job_title].filter(Boolean).join(" ").toLowerCase().includes(qq);
    });
  }, [rows, q, role, trade, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search employees…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button onClick={() => setDialog({ open: true, row: null })}>
          <Plus className="h-4 w-4" />Add employee
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {EMPLOYEE_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={trade} onValueChange={setTrade}>
          <SelectTrigger><SelectValue placeholder="Trade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All trades</SelectItem>
            {TRADES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {EMPLOYEE_STATUS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? "No employees yet" : "No matches"}
          desc={rows.length === 0 ? "Add the first team member to start assigning people to projects." : "Try different filters."}
          action={rows.length === 0 ? <Button onClick={() => setDialog({ open: true, row: null })}><Plus className="h-4 w-4" />Add employee</Button> : null}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const st = EMPLOYEE_STATUS.find((s) => s.value === e.status);
            return (
              <ContactCard
                key={e.id}
                title={fullName(e) || "Unnamed"}
                subtitle={`${labelOf(EMPLOYEE_ROLES, e.role)} · ${labelOf(TRADES, e.trade)}`}
                email={e.email}
                phone={e.phone}
                status={st ? { label: st.label, tone: st.tone } : null}
                badges={e.job_title ? [{ label: e.job_title, tone: "neutral" }] : []}
                onEdit={() => setDialog({ open: true, row: e })}
                onDelete={() => setConfirmDel(e)}
                deleteLabel="Delete employee"
              />
            );
          })}
        </div>
      )}

      <EmployeeDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        employee={dialog.row}
        onSaved={load}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {confirmDel ? fullName(confirmDel) : ""}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteEmployee(confirmDel.id); toast.success("Employee deleted"); await load(); }
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

function SubcontractorsPanel() {
  const [rows, setRows] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [trade, setTrade] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [qual, setQual] = useState<string>("all");
  const [dialog, setDialog] = useState<{ open: boolean; row: Subcontractor | null }>({ open: false, row: null });
  const [confirmDel, setConfirmDel] = useState<Subcontractor | null>(null);

  async function load() {
    setLoading(true);
    try { setRows(await listSubcontractors()); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (trade !== "all" && r.trade !== trade) return false;
      if (status !== "all" && r.status !== status) return false;
      if (qual !== "all" && r.qualification_status !== qual) return false;
      if (!qq) return true;
      return [r.company_name, r.contact_person, r.email, r.phone].filter(Boolean).join(" ").toLowerCase().includes(qq);
    });
  }, [rows, q, trade, status, qual]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search subcontractors…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button onClick={() => setDialog({ open: true, row: null })}>
          <Plus className="h-4 w-4" />Add subcontractor
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Select value={trade} onValueChange={setTrade}>
          <SelectTrigger><SelectValue placeholder="Trade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All trades</SelectItem>
            {TRADES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {SUBCONTRACTOR_STATUS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={qual} onValueChange={setQual}>
          <SelectTrigger><SelectValue placeholder="Qualification" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All qualifications</SelectItem>
            {QUALIFICATION_STATUS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={rows.length === 0 ? "No subcontractors yet" : "No matches"}
          desc={rows.length === 0 ? "Add subcontractor companies to keep their qualifications and contacts in one place." : "Try different filters."}
          action={rows.length === 0 ? <Button onClick={() => setDialog({ open: true, row: null })}><Plus className="h-4 w-4" />Add subcontractor</Button> : null}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const st = SUBCONTRACTOR_STATUS.find((x) => x.value === s.status);
            const ql = QUALIFICATION_STATUS.find((x) => x.value === s.qualification_status);
            return (
              <ContactCard
                key={s.id}
                title={s.company_name}
                subtitle={`${labelOf(TRADES, s.trade)}${s.contact_person ? ` · ${s.contact_person}` : ""}`}
                email={s.email}
                phone={s.phone}
                status={st ? { label: st.label, tone: st.tone } : null}
                badges={ql ? [{ label: ql.label, tone: ql.tone }] : []}
                rating={s.rating}
                onEdit={() => setDialog({ open: true, row: s })}
                onDelete={() => setConfirmDel(s)}
                deleteLabel="Delete subcontractor"
              />
            );
          })}
        </div>
      )}

      <SubcontractorDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        subcontractor={dialog.row}
        onSaved={load}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete subcontractor?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {confirmDel?.company_name}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteSubcontractor(confirmDel.id); toast.success("Deleted"); await load(); }
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

function EmptyState({ title, desc, action }: { title: string; desc: string; action: React.ReactNode }) {
  return (
    <Card className="border-dashed border-border/70">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Users2 className="h-6 w-6" />
        </div>
        <div className="text-base font-semibold">{title}</div>
        <p className="max-w-sm text-sm text-muted-foreground">{desc}</p>
        {action}
      </CardContent>
    </Card>
  );
}
