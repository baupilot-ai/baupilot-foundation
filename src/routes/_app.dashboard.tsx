import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FolderKanban,
  Users,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — BauPilot AI" },
      { name: "description", content: "Overview of your construction company workspace." },
    ],
  }),
  component: DashboardPage,
});

const stats = [
  { label: "Active projects", value: "0", icon: FolderKanban, hint: "Get started" },
  { label: "Team members", value: "1", icon: Users, hint: "Invite your team" },
  { label: "Company", value: "1", icon: Building2, hint: "Set up profile" },
  { label: "Utilization", value: "—", icon: TrendingUp, hint: "Available soon" },
];

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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <StatusBadge tone="neutral" dot={false}>
                  {s.hint}
                </StatusBadge>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-semibold tracking-tight text-foreground">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
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
