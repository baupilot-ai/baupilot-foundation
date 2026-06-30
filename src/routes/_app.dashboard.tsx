import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FolderKanban, Archive, CheckCircle2, PauseCircle, ArrowUpRight, Plus,
  CalendarDays, CheckSquare, AlertOctagon, FileText, Layers, FileWarning,
  Users2, Building2, UserCheck, Briefcase,
  Hammer, Wrench, AlertTriangle, Package, Truck, Clock,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { getDashboardDocStats } from "@/lib/documents";
import { getTeamDashboardStats } from "@/lib/team";
import { getResourceDashboardStats } from "@/lib/resources";
import { useProfile, profileDisplayName } from "@/hooks/use-profile";

export const Route = createFileRoute("/_app/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — BauPilot AI" },
      { name: "description", content: "Overview of your construction company workspace." },
    ],
  }),
  component: DashboardPage,
});

interface Stats {
  active: number; planned: number; on_hold: number; completed: number; archived: number;
  dailyReportsWeek: number; openTasks: number; openDefects: number;
  docsThisWeek: number; plansAwaitingReview: number; supersededPlans: number;
  activeEmployees: number; activeSubcontractors: number;
  assignedEmployees: number; assignedSubcontractors: number;
  equipmentAvailable: number; equipmentAssigned: number; equipmentDefective: number;
  lowStock: number; deliveriesUpcoming: number; deliveriesDelayed: number; maintenanceDueSoon: number;
}

function useStats() {
  const [stats, setStats] = useState<Stats>({
    active: 0, planned: 0, on_hold: 0, completed: 0, archived: 0,
    dailyReportsWeek: 0, openTasks: 0, openDefects: 0,
    docsThisWeek: 0, plansAwaitingReview: 0, supersededPlans: 0,
    activeEmployees: 0, activeSubcontractors: 0, assignedEmployees: 0, assignedSubcontractors: 0,
    equipmentAvailable: 0, equipmentAssigned: 0, equipmentDefective: 0,
    lowStock: 0, deliveriesUpcoming: 0, deliveriesDelayed: 0, maintenanceDueSoon: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const [projects, dr, tk, df, docs, team, res] = await Promise.all([
        supabase.from("projects").select("current_status, archived_at"),
        supabase.from("daily_reports").select("id", { count: "exact", head: true }).gte("report_date", weekAgo),
        supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "done"),
        supabase.from("defects").select("id", { count: "exact", head: true }).not("status", "in", '("accepted","rejected","fixed")'),
        getDashboardDocStats(),
        getTeamDashboardStats().catch(() => ({ activeEmployees: 0, activeSubcontractors: 0, assignedEmployees: 0, assignedSubcontractors: 0 })),
        getResourceDashboardStats().catch(() => ({ equipmentAvailable: 0, equipmentAssigned: 0, equipmentDefective: 0, lowStock: 0, deliveriesUpcoming: 0, deliveriesDelayed: 0, maintenanceDueSoon: 0 })),
      ]);
      const s: Stats = {
        active: 0, planned: 0, on_hold: 0, completed: 0, archived: 0,
        dailyReportsWeek: dr.count ?? 0, openTasks: tk.count ?? 0, openDefects: df.count ?? 0,
        docsThisWeek: docs.docsThisWeek, plansAwaitingReview: docs.plansAwaitingReview, supersededPlans: docs.supersededPlans,
        activeEmployees: team.activeEmployees, activeSubcontractors: team.activeSubcontractors,
        assignedEmployees: team.assignedEmployees, assignedSubcontractors: team.assignedSubcontractors,
        ...res,
      };
      for (const p of projects.data ?? []) {
        if (p.archived_at) { s.archived++; continue; }
        if (p.current_status === "active") s.active++;
        else if (p.current_status === "planned" || p.current_status === "planning") s.planned++;
        else if (p.current_status === "on_hold") s.on_hold++;
        else if (p.current_status === "completed") s.completed++;
      }
      setStats(s); setLoading(false);
    })();
  }, []);
  return { stats, loading };
}

function DashboardPage() {
  const { profile } = useProfile();
  const name = profileDisplayName(profile);
  const { stats: s } = useStats();
  const projectItems = [
    { label: "Active", value: s.active, icon: FolderKanban, tone: "info" as const },
    { label: "Planned", value: s.planned, icon: FolderKanban, tone: "neutral" as const },
    { label: "On hold", value: s.on_hold, icon: PauseCircle, tone: "warning" as const },
    { label: "Completed", value: s.completed, icon: CheckCircle2, tone: "success" as const },
    { label: "Archived", value: s.archived, icon: Archive, tone: "neutral" as const },
  ];
  const opsItems = [
    { label: "Daily reports (7d)", value: s.dailyReportsWeek, icon: CalendarDays, tone: "info" as const },
    { label: "Open tasks", value: s.openTasks, icon: CheckSquare, tone: "warning" as const },
    { label: "Open defects", value: s.openDefects, icon: AlertOctagon, tone: "danger" as const },
  ];
  const docItems = [
    { label: "Documents (7d)", value: s.docsThisWeek, icon: FileText, tone: "info" as const },
    { label: "Plans awaiting review", value: s.plansAwaitingReview, icon: Layers, tone: "warning" as const },
    { label: "Superseded plans", value: s.supersededPlans, icon: FileWarning, tone: "neutral" as const },
  ];
  const teamItems = [
    { label: "Active employees", value: s.activeEmployees, icon: Users2, tone: "info" as const },
    { label: "Active subcontractors", value: s.activeSubcontractors, icon: Building2, tone: "info" as const },
    { label: "Employees on projects", value: s.assignedEmployees, icon: UserCheck, tone: "success" as const },
    { label: "Subs on projects", value: s.assignedSubcontractors, icon: Briefcase, tone: "success" as const },
  ];
  const resItems = [
    { label: "Available equipment", value: s.equipmentAvailable, icon: Hammer, tone: "success" as const },
    { label: "Assigned equipment", value: s.equipmentAssigned, icon: Hammer, tone: "info" as const },
    { label: "Defective equipment", value: s.equipmentDefective, icon: AlertTriangle, tone: "danger" as const },
    { label: "Materials low stock", value: s.lowStock, icon: Package, tone: "warning" as const },
    { label: "Deliveries (7d)", value: s.deliveriesUpcoming, icon: Truck, tone: "info" as const },
    { label: "Deliveries delayed", value: s.deliveriesDelayed, icon: Truck, tone: "danger" as const },
    { label: "Maintenance due soon", value: s.maintenanceDueSoon, icon: Wrench, tone: "warning" as const },
  ];
  // unused but kept for tone variant breadth
  void Clock;
  return (
    <div className="space-y-8">
      <PageHeader
        title={name ? `Welcome back, ${name.split(" ")[0]}` : "Welcome back"}
        description="Here's an overview of your workspace."
        actions={
          <Button asChild>
            <Link to="/projects/new"><Plus className="h-4 w-4" />New project</Link>
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {projectItems.map((i) => <StatCard key={i.label} {...i} sub="projects" />)}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {opsItems.map((i) => <StatCard key={i.label} {...i} sub="site activity" />)}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {docItems.map((i) => <StatCard key={i.label} {...i} sub="documents & plans" />)}
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {teamItems.map((i) => <StatCard key={i.label} {...i} sub="people" />)}
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {resItems.map((i) => <StatCard key={i.label} {...i} sub="resources" />)}
      </section>



      <section>
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Get started</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">View all<ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Complete your company profile", desc: "Add your company details, logo, and address.", to: "/company", cta: "Set up" },
              { title: "Create your first project", desc: "Add a construction project to start organizing your work.", to: "/projects/new", cta: "Create" },
              { title: "Update your profile", desc: "Add your name, role and contact details.", to: "/profile", cta: "Edit" },
            ].map((item) => (
              <div key={item.title} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{item.desc}</div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={item.to}>{item.cta}</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone, sub }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: "info" | "neutral" | "warning" | "success" | "danger"; sub: string }) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
          <StatusBadge tone={tone} dot={false}>{label}</StatusBadge>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
        </div>
      </CardContent>
    </Card>
  );
}
