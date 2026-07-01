import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, Cloud, Users, Loader2, Edit, Download, Mail, FileSpreadsheet, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { listReports, deleteReport, REPORT_STATUS, type DailyReport } from "@/lib/daily-reports";
import { SITE_STATUS } from "@/lib/site-modules";
import { formatDate } from "@/lib/i18n";
import { DailyReportEditor } from "./daily-report-editor";

export function DailyReportsTab({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<DailyReport | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [onlyDelays, setOnlyDelays] = useState(false);
  const [onlyIncidents, setOnlyIncidents] = useState(false);
  const [onlyImpact, setOnlyImpact] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setItems(await listReports(projectId, {
        status: statusFilter === "all" ? undefined : statusFilter,
        from: dateFilter || undefined,
        to: dateFilter || undefined,
        search: search || undefined,
      }));
    } catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
    finally { setLoading(false); }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [projectId, statusFilter, dateFilter]);

  const filtered = items.filter((r) => {
    if (onlyDelays && !(r.delays && r.delays.trim())) return false;
    if (onlyIncidents && !(r.incidents && r.incidents.trim())) return false;
    if (onlyImpact && !r.weather_impact) return false;
    return true;
  });

  function exportPlaceholder(kind: "pdf" | "xlsx" | "email") {
    toast.info(t(`dailyReports.export.${kind}Pending`));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") load(); }} placeholder={t("dailyReports.searchPlaceholder")} className="w-56 pl-8" />
          </div>
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-auto" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dailyReports.filters.all")}</SelectItem>
              {REPORT_STATUS.map((s) => <SelectItem key={s.value} value={s.value}>{t(s.label)}</SelectItem>)}
            </SelectContent>
          </Select>
          {(dateFilter || statusFilter !== "all" || search) && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFilter(""); setStatusFilter("all"); setSearch(""); }}>{t("dailyReports.clearFilter")}</Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportPlaceholder("pdf")}><Download className="h-4 w-4" />PDF</Button>
          <Button variant="outline" size="sm" onClick={() => exportPlaceholder("xlsx")}><FileSpreadsheet className="h-4 w-4" />Excel</Button>
          <Button variant="outline" size="sm" onClick={() => exportPlaceholder("email")}><Mail className="h-4 w-4" />{t("dailyReports.export.email")}</Button>
          <Button onClick={() => { setEditingId(null); setEditorOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("dailyReports.new")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">{t("dailyReports.quickFilters", "Schnellfilter")}:</span>
        <Button size="sm" variant={onlyDelays ? "default" : "outline"} onClick={() => setOnlyDelays((v) => !v)}>{t("dailyReports.filters.withDelays", "Mit Behinderung")}</Button>
        <Button size="sm" variant={onlyIncidents ? "default" : "outline"} onClick={() => setOnlyIncidents((v) => !v)}>{t("dailyReports.filters.withIncidents", "Mit Unfall/Vorfall")}</Button>
        <Button size="sm" variant={onlyImpact ? "default" : "outline"} onClick={() => setOnlyImpact((v) => !v)}>{t("dailyReports.filters.withWeatherImpact", "Wetterbeeinflussung")}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={() => { setEditingId(null); setEditorOpen(true); }} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => {
            const s = SITE_STATUS.find((x) => x.value === r.site_status);
            const rs = REPORT_STATUS.find((x) => x.value === r.status);
            return (
              <Card key={r.id} className="border-border/70 cursor-pointer hover:border-primary/40" onClick={() => { setEditingId(r.id); setEditorOpen(true); }}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{formatDate(r.report_date)}</span>
                        {rs && <StatusBadge tone={rs.tone}>{t(rs.label)}</StatusBadge>}
                        {s && <StatusBadge tone={s.tone}>{t(`dailyReports.status.${s.value}`, s.label)}</StatusBadge>}
                        {r.weather_condition && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Cloud className="h-3.5 w-3.5" />{t(`dailyReports.weather.${r.weather_condition}`, r.weather_condition)}
                            {r.temperature != null && <> · {r.temperature}°</>}
                          </span>
                        )}
                        {r.workers_count != null && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />{r.workers_count}
                          </span>
                        )}
                      </div>
                      {r.work_performed && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.work_performed}</p>
                      )}
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" aria-label={t("common.edit")} onClick={() => { setEditingId(r.id); setEditorOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label={t("common.delete")} onClick={() => setConfirmDel(r)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DailyReportEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        projectId={projectId}
        reportId={editingId}
        onSaved={load}
      />

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dailyReports.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("dailyReports.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDel) return;
                try { await deleteReport(confirmDel.id); toast.success(t("states.deleted")); setConfirmDel(null); load(); }
                catch (e) { toast.error(e instanceof Error ? e.message : t("states.failed")); }
              }}
            >{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="border-dashed border-border/70 bg-muted/30">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <CalendarDays className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{t("dailyReports.empty")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("dailyReports.emptyDesc")}</p>
        <Button onClick={onCreate}><Plus className="h-4 w-4" />{t("dailyReports.create")}</Button>
      </CardContent>
    </Card>
  );
}
