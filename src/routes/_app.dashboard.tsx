import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderKanban, Archive, CheckCircle2, PauseCircle, ArrowUpRight, Plus,
  CalendarDays, CheckSquare, AlertOctagon, FileText, Layers, FileWarning,
  Users2, Building2, UserCheck, Briefcase,
  Hammer, Wrench, AlertTriangle, Package, Truck,
  BarChart3, Flag, Bell, Calendar as CalendarIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { getDashboardDocStats } from "@/lib/documents";
import { getTeamDashboardStats } from "@/lib/team";
import { getResourceDashboardStats } from "@/lib/resources";
import { getPlanningDashboardStats } from "@/lib/planning";
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
  overallProgress: number; upcomingMilestones: number; delayedActivities: number; dueThisWeek: number; unreadNotifications: number;
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
  const { t } = useTranslation();
  const { profile } = useProfile();
  const name = profileDisplayName(profile);
  const { stats: s } = useStats();
  const projectItems = [
    { label: t("dashboard.stats.active"), value: s.active, icon: FolderKanban, tone: "info" as const },
    { label: t("dashboard.stats.planned"), value: s.planned, icon: FolderKanban, tone: "neutral" as const },
    { label: t("dashboard.stats.onHold"), value: s.on_hold, icon: PauseCircle, tone: "warning" as const },
    { label: t("dashboard.stats.completed"), value: s.completed, icon: CheckCircle2, tone: "success" as const },
    { label: t("dashboard.stats.archived"), value: s.archived, icon: Archive, tone: "neutral" as const },
  ];
  const opsItems = [
    { label: t("dashboard.stats.dailyReports7d"), value: s.dailyReportsWeek, icon: CalendarDays, tone: "info" as const },
    { label: t("dashboard.stats.openTasks"), value: s.openTasks, icon: CheckSquare, tone: "warning" as const },
    { label: t("dashboard.stats.openDefects"), value: s.openDefects, icon: AlertOctagon, tone: "danger" as const },
  ];
  const docItems = [
    { label: t("dashboard.stats.documents7d"), value: s.docsThisWeek, icon: FileText, tone: "info" as const },
    { label: t("dashboard.stats.plansAwaiting"), value: s.plansAwaitingReview, icon: Layers, tone: "warning" as const },
    { label: t("dashboard.stats.supersededPlans"), value: s.supersededPlans, icon: FileWarning, tone: "neutral" as const },
  ];
  const teamItems = [
    { label: t("dashboard.stats.activeEmployees"), value: s.activeEmployees, icon: Users2, tone: "info" as const },
    { label: t("dashboard.stats.activeSubs"), value: s.activeSubcontractors, icon: Building2, tone: "info" as const },
    { label: t("dashboard.stats.employeesOnProjects"), value: s.assignedEmployees, icon: UserCheck, tone: "success" as const },
    { label: t("dashboard.stats.subsOnProjects"), value: s.assignedSubcontractors, icon: Briefcase, tone: "success" as const },
  ];
  const resItems = [
    { label: t("dashboard.stats.equipmentAvailable"), value: s.equipmentAvailable, icon: Hammer, tone: "success" as const },
    { label: t("dashboard.stats.equipmentAssigned"), value: s.equipmentAssigned, icon: Hammer, tone: "info" as const },
    { label: t("dashboard.stats.equipmentDefective"), value: s.equipmentDefective, icon: AlertTriangle, tone: "danger" as const },
    { label: t("dashboard.stats.lowStock"), value: s.lowStock, icon: Package, tone: "warning" as const },
    { label: t("dashboard.stats.deliveries7d"), value: s.deliveriesUpcoming, icon: Truck, tone: "info" as const },
    { label: t("dashboard.stats.deliveriesDelayed"), value: s.deliveriesDelayed, icon: Truck, tone: "danger" as const },
    { label: t("dashboard.stats.maintenanceDueSoon"), value: s.maintenanceDueSoon, icon: Wrench, tone: "warning" as const },
  ];
  return (
    <div className="space-y-8">
      <PageHeader
        title={name ? t("dashboard.welcomeBackName", { name: name.split(" ")[0] }) : t("dashboard.welcomeBack")}
        description={t("dashboard.overview")}
        actions={
          <Button asChild>
            <Link to="/projects/new"><Plus className="h-4 w-4" />{t("dashboard.newProject")}</Link>
          </Button>
        }
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {projectItems.map((i) => <StatCard key={i.label} {...i} sub={t("dashboard.sections.projects")} />)}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {opsItems.map((i) => <StatCard key={i.label} {...i} sub={t("dashboard.sections.siteActivity")} />)}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {docItems.map((i) => <StatCard key={i.label} {...i} sub={t("dashboard.sections.documentsPlans")} />)}
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {teamItems.map((i) => <StatCard key={i.label} {...i} sub={t("dashboard.sections.people")} />)}
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {resItems.map((i) => <StatCard key={i.label} {...i} sub={t("dashboard.sections.resources")} />)}
      </section>

      <section>
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("dashboard.getStarted")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">{t("common.viewAll")}<ArrowUpRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: t("dashboard.setupCompany"), desc: t("dashboard.setupCompanyDesc"), to: "/company", cta: t("dashboard.setupCompanyCta") },
              { title: t("dashboard.createFirstProject"), desc: t("dashboard.createFirstProjectDesc"), to: "/projects/new", cta: t("dashboard.createFirstProjectCta") },
              { title: t("dashboard.updateProfile"), desc: t("dashboard.updateProfileDesc"), to: "/profile", cta: t("dashboard.updateProfileCta") },
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
