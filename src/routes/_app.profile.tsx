import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — BauPilot AI" },
      { name: "description", content: "Manage your personal profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  function onSave(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Profile updated");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your personal information and role." />

      <form onSubmit={onSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardHeader>
            <CardTitle>You</CardTitle>
            <CardDescription>Your account in this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                AM
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-semibold text-foreground">Alex Müller</div>
              <div className="text-sm text-muted-foreground">alex@example.com</div>
            </div>
            <StatusBadge tone="primary">Company Owner</StatusBadge>
            <Button type="button" variant="outline" size="sm">
              Change photo
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Update your name, contact and role.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fname">First name</Label>
              <Input id="fname" defaultValue="Alex" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lname">Last name</Label>
              <Input id="lname" defaultValue="Müller" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="alex@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+49 …" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select defaultValue="owner">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Company Owner</SelectItem>
                  <SelectItem value="pm">Project Manager</SelectItem>
                  <SelectItem value="site">Site Manager</SelectItem>
                  <SelectItem value="foreman">Foreman</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 flex justify-end gap-2">
          <Button type="button" variant="ghost">
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
