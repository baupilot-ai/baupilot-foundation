import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
import { supabase } from "@/integrations/supabase/client";
import { setAppLanguage, type SupportedLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/_app/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Profile — BauPilot AI" },
      { name: "description", content: "Manage your personal profile." },
    ],
  }),
  component: ProfilePage,
});

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  language: string;
}

const EMPTY: ProfileForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "owner",
  language: "de",
};

function ProfilePage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!alive) return;
      setForm({
        first_name: data?.first_name ?? (user.user_metadata?.first_name as string) ?? "",
        last_name: data?.last_name ?? (user.user_metadata?.last_name as string) ?? "",
        email: data?.email ?? user.email ?? "",
        phone: data?.phone ?? "",
        role: data?.role ?? "owner",
        language: data?.language ?? "de",
      });
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        language: form.language,
      });
      if (error) throw error;
      if (form.language === "de" || form.language === "en") {
        setAppLanguage(form.language as SupportedLanguage);
      }
      toast.success(t("profile.profileUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const initials = ((form.first_name?.[0] ?? "") + (form.last_name?.[0] ?? "")).toUpperCase()
    || (form.email?.slice(0, 2).toUpperCase() ?? "BP");
  const fullName = [form.first_name, form.last_name].filter(Boolean).join(" ") || form.email || "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} description={t("profile.subtitle")} />

      <form onSubmit={onSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("profile.you")}</CardTitle>
            <CardDescription>{t("profile.youDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-semibold text-foreground">{fullName}</div>
              <div className="text-sm text-muted-foreground">{form.email}</div>
            </div>
            <StatusBadge tone="primary">{t(`roles.${form.role}`, { defaultValue: form.role })}</StatusBadge>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("profile.personalDetails")}</CardTitle>
            <CardDescription>{t("profile.personalDetailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fname">{t("auth.firstName")}</Label>
              <Input id="fname" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lname">{t("auth.lastName")}</Label>
              <Input id="lname" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" value={form.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("profile.phone")}</Label>
              <Input id="phone" type="tel" placeholder="+49 …" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("profile.role")}</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">{t("roles.owner")}</SelectItem>
                  <SelectItem value="pm">{t("roles.pm")}</SelectItem>
                  <SelectItem value="site">{t("roles.site")}</SelectItem>
                  <SelectItem value="foreman">{t("roles.foreman")}</SelectItem>
                  <SelectItem value="worker">{t("roles.worker")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("common.language")}</Label>
              <Select
                value={form.language}
                onValueChange={(v) => {
                  setForm({ ...form, language: v });
                  if (v === "de" || v === "en") setAppLanguage(v as SupportedLanguage);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 flex justify-end gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? t("common.saving") : t("profile.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
