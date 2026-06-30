import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Building2, Upload, Loader2, X } from "lucide-react";
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
import {
  getMyCompany,
  updateCompany,
  uploadCompanyLogo,
  getLogoSignedUrl,
  type CompanyRow,
} from "@/lib/companies";

export const Route = createFileRoute("/_app/company")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Company — BauPilot AI" },
      { name: "description", content: "Manage your construction company profile." },
    ],
  }),
  component: CompanyPage,
});

interface Form {
  name: string;
  industry: string;
  company_size: string;
  address: string;
  vat_id: string;
  phone: string;
  email: string;
  about: string;
  logo_url: string | null;
}

const EMPTY: Form = {
  name: "",
  industry: "",
  company_size: "",
  address: "",
  vat_id: "",
  phone: "",
  email: "",
  about: "",
  logo_url: null,
};

function CompanyPage() {
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const c = await getMyCompany();
        if (!alive) return;
        if (c) {
          setCompany(c);
          setForm({
            name: c.name ?? "",
            industry: c.industry ?? "",
            company_size: c.company_size ?? "",
            address: c.address ?? "",
            vat_id: c.vat_id ?? "",
            phone: c.phone ?? "",
            email: c.email ?? "",
            about: "",
            logo_url: c.logo_url,
          });
          if (c.logo_url) getLogoSignedUrl(c.logo_url).then(setLogoPreview);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load company");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB");
      return;
    }
    setUploadingLogo(true);
    try {
      const path = await uploadCompanyLogo(company.id, file);
      const updated = await updateCompany(company.id, { logo_url: path });
      setCompany(updated);
      setForm((f) => ({ ...f, logo_url: path }));
      const url = await getLogoSignedUrl(path);
      setLogoPreview(url);
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    try {
      const updated = await updateCompany(company.id, {
        name: form.name,
        industry: form.industry || null,
        company_size: form.company_size || null,
        address: form.address || null,
        vat_id: form.vat_id || null,
        phone: form.phone || null,
        email: form.email || null,
      });
      setCompany(updated);
      toast.success("Company profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
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
              <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-9 w-9" />
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploadingLogo}>
                {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {form.logo_url ? "Replace logo" : "Upload logo"}
              </Button>
              {form.logo_url && company && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const updated = await updateCompany(company.id, { logo_url: null });
                    setCompany(updated);
                    setForm((f) => ({ ...f, logo_url: null }));
                    setLogoPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />Remove
                </Button>
              )}
              <p className="text-xs text-muted-foreground">PNG or JPG, up to 2 MB.</p>
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
              <Input id="cname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={form.industry || undefined} onValueChange={(v) => setForm({ ...form, industry: v })}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
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
              <Label>Company size</Label>
              <Select value={form.company_size || undefined} onValueChange={(v) => setForm({ ...form, company_size: v })}>
                <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
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
              <Input id="addr" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, city, postal code, country" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">VAT / Tax ID</Label>
              <Input id="vat" value={form.vat_id} onChange={(e) => setForm({ ...form, vat_id: e.target.value })} placeholder="DE123456789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+49 …" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Contact email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@yourcompany.com" />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 flex justify-end gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </div>
  );
}
