import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Archive,
  CheckCircle2,
  PauseCircle,
  ArrowUpRight,
  Plus,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { supabase } from "@/integrations/supabase/client";

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

function useProjectStats() {
  const [stats, setStats] = useState({ active: 0, on_hold: 0, completed: 0, archived: 0 });
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("projects").select("current_status, archived_at");
      if (!data) return;
      const s = { active: 0, on_hold: 0, completed: 0, archived: 0 };
      for (const p of data) {
        if (p.archived_at) s.archived++;
        else if (p.current_status === "active" || p.current_status === "planning") s.active++;
        else if (p.current_status === "on_hold") s.on_hold++;
        else if (p.current_status === "completed") s.completed++;
      }
      setStats(s);
    })();
  }, []);
  return stats;
}

function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back"
        description="Here's an overview of your workspace."
        actions={
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </Button>
        }
      />

      <DashboardStats />
    </div>
  );
}

function DashboardStats() {
  const s = useProjectStats();
  const items = [
    { label: "Active projects", value: s.active, icon: FolderKanban, tone: "info" as const },
    { label: "On hold", value: s.on_hold, icon: PauseCircle, tone: "warning" as const },
    { label: "Completed", value: s.completed, icon: CheckCircle2, tone: "success" as const },
    { label: "Archived", value: s.archived, icon: Archive, tone: "neutral" as const },
  ];
  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((i) => (
          <Card key={i.label} className="border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <i.icon className="h-5 w-5" />
                </div>
                <StatusBadge tone={i.tone} dot={false}>
                  {i.label}
                </StatusBadge>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-semibold tracking-tight text-foreground">
                  {i.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{i.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Get started</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "Complete your company profile",
                desc: "Add your company details, logo, and address.",
                to: "/company",
                cta: "Set up",
              },
              {
                title: "Create your first project",
                desc: "Add a construction project to start organizing your work.",
                to: "/projects/new",
                cta: "Create",
              },
              {
                title: "Invite your team",
                desc: "Bring project managers, site managers, and foremen on board.",
                to: "/settings",
                cta: "Invite",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{item.desc}</div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={item.to}>{item.cta}</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardHeader>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <CardTitle className="mt-3">Coming soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Daily reports, defect tracking, task management and AI-assisted workflows are on the way.</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {["Daily reports", "Tasks & defects", "AI assistant", "Document hub"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
