import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BauPilot AI" },
      { name: "description", content: "Workspace, security and notification settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage workspace, security and preferences." />

      <Tabs defaultValue="workspace" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Workspace-wide preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input id="ws-name" defaultValue="BauPilot Workspace" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tz">Timezone</Label>
                  <Input id="tz" defaultValue="Europe/Berlin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cur">Default currency</Label>
                  <Input id="cur" defaultValue="EUR" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Workspace updated")}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpw">Current password</Label>
                <Input id="cpw" type="password" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="npw">New password</Label>
                  <Input id="npw" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rpw">Confirm new password</Label>
                  <Input id="rpw" type="password" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Password updated")}>Update password</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">2FA is currently disabled.</div>
              <Switch />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Project updates", desc: "When projects are created or change status." },
                { label: "Team activity", desc: "Member joins, role changes." },
                { label: "Product updates", desc: "New features and improvements." },
              ].map((row, i) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{row.label}</div>
                      <div className="text-sm text-muted-foreground">{row.desc}</div>
                    </div>
                    <Switch defaultChecked={i < 2} />
                  </div>
                  {i < 2 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Plan and payment method.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Billing is not configured yet. This will be enabled in a future release.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
