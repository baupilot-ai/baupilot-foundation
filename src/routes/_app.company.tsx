import { createFileRoute } from "@tanstack/react-router";
import { Building2, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/_app/company")({
  head: () => ({
    meta: [
      { title: "Company — BauPilot AI" },
      { name: "description", content: "Manage your construction company profile." },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  function onSave(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Company profile saved");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Company" description="Your construction company profile and identity." />

      <form onSubmit={onSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>Logo and display name.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-8 w-8" />
              </div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4" />
                Upload logo
              </Button>
              <p className="text-xs text-muted-foreground">PNG or SVG, up to 2 MB.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle>Company details</CardTitle>
            <CardDescription>Legal and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cname">Company name</Label>
              <Input id="cname" placeholder="Your construction company GmbH" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select defaultValue="general">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General construction</SelectItem>
                  <SelectItem value="civil">Civil engineering</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC / mechanical</SelectItem>
                  <SelectItem value="finishing">Interior / finishing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Company size</Label>
              <Select defaultValue="11_50">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_10">1–10</SelectItem>
                  <SelectItem value="11_50">11–50</SelectItem>
                  <SelectItem value="51_200">51–200</SelectItem>
                  <SelectItem value="200_plus">200+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addr">Address</Label>
              <Input id="addr" placeholder="Street, city, postal code, country" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">VAT / Tax ID</Label>
              <Input id="vat" placeholder="DE123456789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+49 …" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="about">About</Label>
              <Textarea id="about" rows={3} placeholder="Short description of your company." />
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
