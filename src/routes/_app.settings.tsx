import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { type SupportedLanguage } from "@/lib/i18n";
import { useLanguagePref } from "@/hooks/use-language-pref";


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
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguagePref();
  const [savingLang, setSavingLang] = useState(false);

  async function saveLanguage(next: SupportedLanguage) {
    setSavingLang(true);
    try {
      await setLanguage(next);
      toast.success(t("settings.languageSaved"));
    } catch {
      toast.error(t("common.saveFailed"));
    } finally {
      setSavingLang(false);
    }
  }


  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} description={t("settings.subtitle")} />

      <Tabs defaultValue="language" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="language">{t("settings.tabs.language")}</TabsTrigger>
          <TabsTrigger value="workspace">{t("settings.tabs.workspace")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.tabs.security")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("settings.tabs.notifications")}</TabsTrigger>
          <TabsTrigger value="billing">{t("settings.tabs.billing")}</TabsTrigger>
        </TabsList>

        <TabsContent value="language" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{t("settings.languageCard")}</CardTitle>
              <CardDescription>{t("settings.languageDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-sm space-y-2">
                <Label>{t("common.language")}</Label>
                <Select
                  value={language}
                  onValueChange={(v) => saveLanguage(v as SupportedLanguage)}
                  disabled={savingLang}
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
        </TabsContent>

        <TabsContent value="workspace" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{t("settings.workspace")}</CardTitle>
              <CardDescription>{t("settings.workspaceDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">{t("settings.workspaceName")}</Label>
                <Input id="ws-name" defaultValue="BauPilot Workspace" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tz">{t("settings.timezone")}</Label>
                  <Input id="tz" defaultValue="Europe/Berlin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cur">{t("settings.currency")}</Label>
                  <Input id="cur" defaultValue="EUR" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success(t("common.saved"))}>{t("common.save")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{t("settings.password")}</CardTitle>
              <CardDescription>{t("settings.passwordDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpw">{t("settings.currentPassword")}</Label>
                <Input id="cpw" type="password" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="npw">{t("settings.newPassword")}</Label>
                  <Input id="npw" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rpw">{t("settings.confirmPassword")}</Label>
                  <Input id="rpw" type="password" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success(t("common.saved"))}>{t("settings.updatePassword")}</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{t("settings.twoFactor")}</CardTitle>
              <CardDescription>{t("settings.twoFactorDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{t("settings.twoFactorDisabled")}</div>
              <Switch />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{t("settings.tabs.notifications")}</CardTitle>
              <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: t("nav.projects"), desc: t("dashboard.sections.projects") },
                { label: t("nav.team"), desc: t("dashboard.sections.people") },
                { label: t("settings.tabs.notifications"), desc: t("settings.notificationsDesc") },
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
              <CardTitle>{t("settings.tabs.billing")}</CardTitle>
              <CardDescription>{t("settings.billingDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("settings.billingEmpty")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
