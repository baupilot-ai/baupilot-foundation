import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/projects/new")({
  head: () => ({
    meta: [
      { title: "New project — BauPilot AI" },
      { name: "description", content: "Create a new construction project." },
    ],
  }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Project saved (foundation only — backend coming soon)");
    navigate({ to: "/projects" });
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link to="/projects">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </Button>

      <PageHeader
        title="Create project"
        description="Set up a new construction project in your workspace."
      />

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Project details</CardTitle>
              <CardDescription>Basic information about this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input id="name" placeholder="e.g. Riverside Office Tower" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Project code</Label>
                <Input id="code" placeholder="e.g. ROT-2026-01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Short description of scope, client, and goals."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Location & schedule</CardTitle>
              <CardDescription>Where and when this project takes place.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Site address</Label>
                <Input id="address" placeholder="Street, city, postal code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start">Start date</Label>
                <Input id="start" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Estimated completion</Label>
                <Input id="end" type="date" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Setup</CardTitle>
              <CardDescription>Status & ownership.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="planning">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project manager</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign later" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me">Alex Müller (me)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (optional)</Label>
                <Input id="budget" type="number" placeholder="€" />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg">
              Create project
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link to="/projects">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
