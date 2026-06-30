import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, FolderKanban } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — BauPilot AI" },
      { name: "description", content: "All construction projects in your workspace." },
    ],
  }),
  component: ProjectsPage,
});

// Foundation only — no real data yet.
const projects: Array<{
  id: string;
  name: string;
  location: string;
  status: "planning" | "active" | "on_hold" | "completed";
  manager: string;
  updated: string;
}> = [];

const statusMap = {
  planning: { tone: "info" as const, label: "Planning" },
  active: { tone: "success" as const, label: "Active" },
  on_hold: { tone: "warning" as const, label: "On hold" },
  completed: { tone: "neutral" as const, label: "Completed" },
};

function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage all construction projects across your company."
        actions={
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </Button>
        }
      />

      <Card className="border-border/70 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search projects…" className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="recent">
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-border/70 overflow-hidden">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No projects yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create your first construction project to start organizing teams, sites and documents.
            </p>
            <Button asChild className="mt-2">
              <Link to="/projects/new">
                <Plus className="h-4 w-4" />
                Create project
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.location}</TableCell>
                    <TableCell>
                      <StatusBadge tone={statusMap[p.status].tone}>
                        {statusMap[p.status].label}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{p.manager}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.updated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
