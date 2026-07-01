import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Upload, X, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/i18n";
import {
  BUILDING_CATEGORIES,
  CONSTRUCTION_PHASES,
  PROJECT_TYPES,
  STATUS_OPTIONS,
  uploadCoverImage,
  getCoverSignedUrl,
  type ProjectInput,
  type ProjectRow,
} from "@/lib/projects";

const STEP_IDS = ["basics", "location", "timeline", "team", "description", "review"] as const;

function emptyForm(): ProjectInput {
  return {
    project_number: "",
    name: "",
    client: "",
    site_address: "",
    gps_lat: null,
    gps_lng: null,
    project_type: "",
    building_category: "",
    construction_phase: "",
    contract_value: null,
    planned_start: null,
    planned_finish: null,
    actual_start: null,
    actual_finish: null,
    current_status: "planned",
    site_manager: "",
    foreman: "",
    project_manager: "",
    safety_manager: "",
    client_contact: "",
    architect: "",
    structural_engineer: "",
    mep_engineer: "",
    description: "",
    notes: "",
    cover_image_url: null,
  };
}

function fromRow(r: ProjectRow): ProjectInput {
  const {
    id, user_id, company_id, created_by, archived_at, created_at, updated_at, ...rest
  } = r;
  return rest;
}

export interface ProjectWizardProps {
  initial?: ProjectRow | null;
  submitLabel?: string;
  onSubmit: (input: ProjectInput) => Promise<void>;
  onCancel?: () => void;
}

export function ProjectWizard({ initial, submitLabel, onSubmit, onCancel }: ProjectWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProjectInput>(initial ? fromRow(initial) : emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stepTitles = STEP_IDS.map((id) => t(`wizard.steps.${id}`));
  const effectiveSubmitLabel = submitLabel ?? t("wizard.buttons.createProject");

  useEffect(() => {
    if (form.cover_image_url) {
      getCoverSignedUrl(form.cover_image_url).then(setCoverPreview);
    } else {
      setCoverPreview(null);
    }
  }, [form.cover_image_url]);

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("wizard.descriptionStep.tooLarge"));
      return;
    }
    setUploadingCover(true);
    try {
      const path = await uploadCoverImage(file);
      update("cover_image_url", path);
      toast.success(t("wizard.descriptionStep.uploaded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("wizard.descriptionStep.uploadFailed"));
    } finally {
      setUploadingCover(false);
    }
  }

  function validateStep(idx: number): string | null {
    if (idx === 0) {
      if (!form.project_number.trim()) return t("wizard.validation.numberRequired");
      if (!form.name.trim()) return t("wizard.validation.nameRequired");
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    if (step < STEP_IDS.length - 1) setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleSubmit() {
    for (let i = 0; i < STEP_IDS.length; i++) {
      const err = validateStep(i);
      if (err) {
        toast.error(err);
        setStep(i);
        return;
      }
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("wizard.validation.saveFailed"));
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEP_IDS.length) * 100;
  const isReview = step === STEP_IDS.length - 1;

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("wizard.stepOf", { current: step + 1, total: STEP_IDS.length })}</span>
            <span className="font-medium text-foreground">{stepTitles[step]}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 hidden gap-2 sm:flex">
            {STEP_IDS.map((id, i) => (
              <button
                key={id}
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-left text-xs transition-colors",
                  i === step
                    ? "border-primary bg-primary/5 text-foreground"
                    : i < step
                    ? "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                    : "border-dashed border-border text-muted-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold",
                      i === step
                        ? "bg-primary text-primary-foreground"
                        : i < step
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="truncate font-medium">{stepTitles[i]}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {step === 0 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("wizard.basics.title")}</CardTitle>
            <CardDescription>{t("wizard.basics.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`${t("projects.fields.projectNumber")} *`}>
                <Input value={form.project_number} onChange={(e) => update("project_number", e.target.value)} placeholder={t("wizard.basics.numberPlaceholder")} required />
              </Field>
              <Field label={`${t("projects.fields.projectName")} *`}>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={t("wizard.basics.namePlaceholder")} required />
              </Field>
            </div>
            <Field label={t("projects.fields.client")}>
              <Input value={form.client ?? ""} onChange={(e) => update("client", e.target.value)} placeholder={t("wizard.basics.clientPlaceholder")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t("projects.fields.type")}>
                <SelectField value={form.project_type ?? ""} onChange={(v) => update("project_type", v)} options={PROJECT_TYPES} translateNs="projects.types" placeholder={t("wizard.basics.selectType")} />
              </Field>
              <Field label={t("projects.fields.category")}>
                <SelectField value={form.building_category ?? ""} onChange={(v) => update("building_category", v)} options={BUILDING_CATEGORIES} translateNs="projects.categories" placeholder={t("wizard.basics.selectCategory")} />
              </Field>
              <Field label={t("projects.fields.phase")}>
                <SelectField value={form.construction_phase ?? ""} onChange={(v) => update("construction_phase", v)} options={CONSTRUCTION_PHASES} translateNs="projects.phases" placeholder={t("wizard.basics.selectPhase")} />
              </Field>
            </div>
            <Field label={t("projects.fields.status")}>
              <Select value={form.current_status} onValueChange={(v) => update("current_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{t(`projects.status.${s.value}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("wizard.location.title")}</CardTitle>
            <CardDescription>{t("wizard.location.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label={t("projects.fields.siteAddress")}>
              <Input value={form.site_address ?? ""} onChange={(e) => update("site_address", e.target.value)} placeholder={t("wizard.location.addressPlaceholder")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("projects.fields.gpsLat")}>
                <Input type="number" step="any" value={form.gps_lat ?? ""} onChange={(e) => update("gps_lat", e.target.value === "" ? null : Number(e.target.value))} placeholder="47.3769" />
              </Field>
              <Field label={t("projects.fields.gpsLng")}>
                <Input type="number" step="any" value={form.gps_lng ?? ""} onChange={(e) => update("gps_lng", e.target.value === "" ? null : Number(e.target.value))} placeholder="8.5417" />
              </Field>
            </div>
            <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{t("wizard.location.mapPreview")}</p>
              <p className="text-xs text-muted-foreground">
                {form.gps_lat != null && form.gps_lng != null
                  ? `${form.gps_lat}, ${form.gps_lng}`
                  : t("wizard.location.mapHint")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("wizard.timeline.title")}</CardTitle>
            <CardDescription>{t("wizard.timeline.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label={t("projects.fields.contractValue")}>
              <Input type="number" step="0.01" value={form.contract_value ?? ""} onChange={(e) => update("contract_value", e.target.value === "" ? null : Number(e.target.value))} placeholder="0.00" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("projects.fields.plannedStart")}>
                <Input type="date" value={form.planned_start ?? ""} onChange={(e) => update("planned_start", e.target.value || null)} />
              </Field>
              <Field label={t("projects.fields.plannedFinish")}>
                <Input type="date" value={form.planned_finish ?? ""} onChange={(e) => update("planned_finish", e.target.value || null)} />
              </Field>
              <Field label={t("projects.fields.actualStart")}>
                <Input type="date" value={form.actual_start ?? ""} onChange={(e) => update("actual_start", e.target.value || null)} />
              </Field>
              <Field label={t("projects.fields.actualFinish")}>
                <Input type="date" value={form.actual_finish ?? ""} onChange={(e) => update("actual_finish", e.target.value || null)} />
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("wizard.team.title")}</CardTitle>
            <CardDescription>{t("wizard.team.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label={t("projects.fields.projectManager")}><Input value={form.project_manager ?? ""} onChange={(e) => update("project_manager", e.target.value)} /></Field>
            <Field label={t("projects.fields.siteManager")}><Input value={form.site_manager ?? ""} onChange={(e) => update("site_manager", e.target.value)} /></Field>
            <Field label={t("projects.fields.foreman")}><Input value={form.foreman ?? ""} onChange={(e) => update("foreman", e.target.value)} /></Field>
            <Field label={t("projects.fields.safetyManager")}><Input value={form.safety_manager ?? ""} onChange={(e) => update("safety_manager", e.target.value)} /></Field>
            <Field label={t("projects.fields.clientContact")}><Input value={form.client_contact ?? ""} onChange={(e) => update("client_contact", e.target.value)} placeholder={t("wizard.team.clientContactPlaceholder")} /></Field>
            <Field label={t("projects.fields.architect")}><Input value={form.architect ?? ""} onChange={(e) => update("architect", e.target.value)} /></Field>
            <Field label={t("projects.fields.structuralEngineer")}><Input value={form.structural_engineer ?? ""} onChange={(e) => update("structural_engineer", e.target.value)} /></Field>
            <Field label={t("projects.fields.mepEngineer")}><Input value={form.mep_engineer ?? ""} onChange={(e) => update("mep_engineer", e.target.value)} /></Field>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("wizard.descriptionStep.title")}</CardTitle>
            <CardDescription>{t("wizard.descriptionStep.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label={t("projects.fields.description")}>
              <Textarea value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} placeholder={t("wizard.descriptionStep.descriptionPlaceholder")} rows={4} />
            </Field>
            <Field label={t("projects.fields.internalNotes")}>
              <Textarea value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} placeholder={t("wizard.descriptionStep.notesPlaceholder")} rows={4} />
            </Field>
            <div className="space-y-2">
              <Label>{t("projects.fields.coverImage")}</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
                  {coverPreview ? (
                    <img src={coverPreview} alt={t("projects.fields.coverImage")} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-muted-foreground">{t("wizard.descriptionStep.noImage")}</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingCover}>
                    {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {form.cover_image_url ? t("wizard.descriptionStep.replace") : t("wizard.descriptionStep.upload")}
                  </Button>
                  {form.cover_image_url && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => update("cover_image_url", null)}>
                      <X className="h-4 w-4" />{t("wizard.descriptionStep.remove")}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">{t("wizard.descriptionStep.hint")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>{t("wizard.review.title")}</CardTitle>
            <CardDescription>{t("wizard.review.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReviewSection title={t("wizard.steps.basics")} items={[
              [t("projects.fields.projectNumber"), form.project_number],
              [t("projects.fields.projectName"), form.name],
              [t("projects.fields.client"), form.client],
              [t("projects.fields.type"), form.project_type ? t(`projects.types.${form.project_type}`, { defaultValue: form.project_type }) : ""],
              [t("projects.fields.category"), form.building_category ? t(`projects.categories.${form.building_category}`, { defaultValue: form.building_category }) : ""],
              [t("projects.fields.phase"), form.construction_phase ? t(`projects.phases.${form.construction_phase}`, { defaultValue: form.construction_phase }) : ""],
              [t("projects.fields.status"), t(`projects.status.${form.current_status}`, { defaultValue: form.current_status })],
            ]} />
            <ReviewSection title={t("wizard.steps.location")} items={[
              [t("projects.fields.siteAddress"), form.site_address],
              [t("projects.fields.gps"), form.gps_lat != null && form.gps_lng != null ? `${form.gps_lat}, ${form.gps_lng}` : null],
            ]} />
            <ReviewSection title={t("wizard.steps.timeline")} items={[
              [t("projects.detail.contractValue"), form.contract_value != null ? formatCurrency(form.contract_value) : null],
              [t("projects.fields.plannedStart"), form.planned_start],
              [t("projects.fields.plannedFinish"), form.planned_finish],
              [t("projects.fields.actualStart"), form.actual_start],
              [t("projects.fields.actualFinish"), form.actual_finish],
            ]} />
            <ReviewSection title={t("wizard.steps.team")} items={[
              [t("projects.fields.projectManager"), form.project_manager],
              [t("projects.fields.siteManager"), form.site_manager],
              [t("projects.fields.foreman"), form.foreman],
              [t("projects.fields.safetyManager"), form.safety_manager],
              [t("projects.fields.clientContact"), form.client_contact],
              [t("projects.fields.architect"), form.architect],
              [t("projects.fields.structuralEngineer"), form.structural_engineer],
              [t("projects.fields.mepEngineer"), form.mep_engineer],
            ]} />
            <ReviewSection title={t("wizard.steps.description")} items={[
              [t("projects.fields.description"), form.description],
              [t("projects.detail.notes"), form.notes],
            ]} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>{t("wizard.buttons.cancel")}</Button>
          )}
          <Button type="button" variant="outline" onClick={back} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4" />{t("wizard.buttons.back")}
          </Button>
        </div>
        {isReview ? (
          <Button type="button" onClick={handleSubmit} disabled={submitting} className="sm:min-w-[160px]">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {effectiveSubmitLabel}
          </Button>
        ) : (
          <Button type="button" onClick={next} className="sm:min-w-[120px]">
            {t("wizard.buttons.next")}<ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SelectField({
  value, onChange, options, placeholder, translateNs,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  translateNs?: string;
}) {
  const { t } = useTranslation();
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {translateNs ? t(`${translateNs}.${o}`, { defaultValue: o }) : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ReviewSection({ title, items }: { title: string; items: [string, string | number | null | undefined][] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-border/50 py-1.5 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium text-foreground">{value || <span className="text-muted-foreground">—</span>}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
