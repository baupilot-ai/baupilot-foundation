import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Upload, X, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

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
import {
  BUILDING_CATEGORIES,
  CONSTRUCTION_PHASES,
  PROJECT_TYPES,
  STATUS_OPTIONS,
  statusLabel,
  uploadCoverImage,
  getCoverSignedUrl,
  type ProjectInput,
  type ProjectRow,
} from "@/lib/projects";

const STEPS = [
  { id: "basics", title: "Basics" },
  { id: "location", title: "Location" },
  { id: "timeline", title: "Timeline & budget" },
  { id: "team", title: "Responsibilities" },
  { id: "description", title: "Description" },
  { id: "review", title: "Review" },
];

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

export function ProjectWizard({ initial, submitLabel = "Create project", onSubmit, onCancel }: ProjectWizardProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProjectInput>(initial ? fromRow(initial) : emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      toast.error("Image must be under 5MB");
      return;
    }
    setUploadingCover(true);
    try {
      const path = await uploadCoverImage(file);
      update("cover_image_url", path);
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCover(false);
    }
  }

  function validateStep(idx: number): string | null {
    if (idx === 0) {
      if (!form.project_number.trim()) return "Project number is required";
      if (!form.name.trim()) return "Project name is required";
    }
    return null;
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleSubmit() {
    for (let i = 0; i < STEPS.length; i++) {
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
      toast.error(err instanceof Error ? err.message : "Save failed");
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const isReview = step === STEPS.length - 1;

  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span className="font-medium text-foreground">{STEPS[step].title}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 hidden gap-2 sm:flex">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
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
                  <span className="truncate font-medium">{s.title}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {step === 0 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Basic information</CardTitle>
            <CardDescription>Identify the project and its client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project number *">
                <Input value={form.project_number} onChange={(e) => update("project_number", e.target.value)} placeholder="e.g. 2026-001" required />
              </Field>
              <Field label="Project name *">
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Riverside Office Tower" required />
              </Field>
            </div>
            <Field label="Client">
              <Input value={form.client ?? ""} onChange={(e) => update("client", e.target.value)} placeholder="Client / owner organization" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Project type">
                <SelectField value={form.project_type ?? ""} onChange={(v) => update("project_type", v)} options={PROJECT_TYPES} placeholder="Select type" />
              </Field>
              <Field label="Building category">
                <SelectField value={form.building_category ?? ""} onChange={(v) => update("building_category", v)} options={BUILDING_CATEGORIES} placeholder="Select category" />
              </Field>
              <Field label="Construction phase">
                <SelectField value={form.construction_phase ?? ""} onChange={(v) => update("construction_phase", v)} options={CONSTRUCTION_PHASES} placeholder="Select phase" />
              </Field>
            </div>
            <Field label="Status">
              <Select value={form.current_status} onValueChange={(v) => update("current_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
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
            <CardTitle>Location</CardTitle>
            <CardDescription>Where the project takes place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Site address">
              <Input value={form.site_address ?? ""} onChange={(e) => update("site_address", e.target.value)} placeholder="Street, city, postal code" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="GPS latitude">
                <Input type="number" step="any" value={form.gps_lat ?? ""} onChange={(e) => update("gps_lat", e.target.value === "" ? null : Number(e.target.value))} placeholder="47.3769" />
              </Field>
              <Field label="GPS longitude">
                <Input type="number" step="any" value={form.gps_lng ?? ""} onChange={(e) => update("gps_lng", e.target.value === "" ? null : Number(e.target.value))} placeholder="8.5417" />
              </Field>
            </div>
            <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Map preview</p>
              <p className="text-xs text-muted-foreground">
                {form.gps_lat != null && form.gps_lng != null
                  ? `${form.gps_lat}, ${form.gps_lng}`
                  : "Enter coordinates to position the site on the map (coming soon)."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Timeline & budget</CardTitle>
            <CardDescription>Contract value and key dates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Contract value (€)">
              <Input type="number" step="0.01" value={form.contract_value ?? ""} onChange={(e) => update("contract_value", e.target.value === "" ? null : Number(e.target.value))} placeholder="0.00" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Planned start">
                <Input type="date" value={form.planned_start ?? ""} onChange={(e) => update("planned_start", e.target.value || null)} />
              </Field>
              <Field label="Planned finish">
                <Input type="date" value={form.planned_finish ?? ""} onChange={(e) => update("planned_finish", e.target.value || null)} />
              </Field>
              <Field label="Actual start">
                <Input type="date" value={form.actual_start ?? ""} onChange={(e) => update("actual_start", e.target.value || null)} />
              </Field>
              <Field label="Actual finish">
                <Input type="date" value={form.actual_finish ?? ""} onChange={(e) => update("actual_finish", e.target.value || null)} />
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
            <CardDescription>Internal team and external contacts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Project manager"><Input value={form.project_manager ?? ""} onChange={(e) => update("project_manager", e.target.value)} /></Field>
            <Field label="Site manager"><Input value={form.site_manager ?? ""} onChange={(e) => update("site_manager", e.target.value)} /></Field>
            <Field label="Foreman"><Input value={form.foreman ?? ""} onChange={(e) => update("foreman", e.target.value)} /></Field>
            <Field label="Safety manager"><Input value={form.safety_manager ?? ""} onChange={(e) => update("safety_manager", e.target.value)} /></Field>
            <Field label="Client contact"><Input value={form.client_contact ?? ""} onChange={(e) => update("client_contact", e.target.value)} placeholder="Name, email or phone" /></Field>
            <Field label="Architect"><Input value={form.architect ?? ""} onChange={(e) => update("architect", e.target.value)} /></Field>
            <Field label="Structural engineer"><Input value={form.structural_engineer ?? ""} onChange={(e) => update("structural_engineer", e.target.value)} /></Field>
            <Field label="MEP engineer"><Input value={form.mep_engineer ?? ""} onChange={(e) => update("mep_engineer", e.target.value)} /></Field>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Description & cover</CardTitle>
            <CardDescription>Provide context and upload a cover image.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Description">
              <Textarea value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} placeholder="Scope, goals, context" rows={4} />
            </Field>
            <Field label="Internal notes">
              <Textarea value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} placeholder="Private notes for your team" rows={4} />
            </Field>
            <div className="space-y-2">
              <Label>Cover image</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingCover}>
                    {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {form.cover_image_url ? "Replace image" : "Upload image"}
                  </Button>
                  {form.cover_image_url && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => update("cover_image_url", null)}>
                      <X className="h-4 w-4" />Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">JPG/PNG, up to 5MB.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Review</CardTitle>
            <CardDescription>Confirm details before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReviewSection title="Basics" items={[
              ["Project number", form.project_number],
              ["Project name", form.name],
              ["Client", form.client],
              ["Type", form.project_type],
              ["Category", form.building_category],
              ["Phase", form.construction_phase],
              ["Status", statusLabel(form.current_status)],
            ]} />
            <ReviewSection title="Location" items={[
              ["Site address", form.site_address],
              ["GPS", form.gps_lat != null && form.gps_lng != null ? `${form.gps_lat}, ${form.gps_lng}` : null],
            ]} />
            <ReviewSection title="Timeline & budget" items={[
              ["Contract value", form.contract_value != null ? `€ ${form.contract_value.toLocaleString()}` : null],
              ["Planned start", form.planned_start],
              ["Planned finish", form.planned_finish],
              ["Actual start", form.actual_start],
              ["Actual finish", form.actual_finish],
            ]} />
            <ReviewSection title="Responsibilities" items={[
              ["Project manager", form.project_manager],
              ["Site manager", form.site_manager],
              ["Foreman", form.foreman],
              ["Safety manager", form.safety_manager],
              ["Client contact", form.client_contact],
              ["Architect", form.architect],
              ["Structural engineer", form.structural_engineer],
              ["MEP engineer", form.mep_engineer],
            ]} />
            <ReviewSection title="Description" items={[
              ["Description", form.description],
              ["Notes", form.notes],
            ]} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
          )}
          <Button type="button" variant="outline" onClick={back} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
        </div>
        {isReview ? (
          <Button type="button" onClick={handleSubmit} disabled={submitting} className="sm:min-w-[160px]">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitLabel}
          </Button>
        ) : (
          <Button type="button" onClick={next} className="sm:min-w-[120px]">
            Next<ArrowRight className="h-4 w-4" />
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
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
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
