import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Upload, X, Loader2 } from "lucide-react";
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
  uploadCoverImage,
  getCoverSignedUrl,
  type ProjectInput,
  type ProjectRow,
} from "@/lib/projects";

const STEPS = [
  { id: "basics", title: "Basics" },
  { id: "location", title: "Location & schedule" },
  { id: "team", title: "Internal team" },
  { id: "contacts", title: "External contacts" },
  { id: "notes", title: "Notes" },
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
    current_status: "planning",
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
  const { id, user_id, archived_at, created_at, updated_at, ...rest } = r;
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
    for (let i = 0; i <= step; i++) {
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

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <Card className="border-border/70">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="font-medium text-foreground">{STEPS[step].title}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
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
            <CardTitle>Project basics</CardTitle>
            <CardDescription>Identify the project and its client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project number *">
                <Input
                  value={form.project_number}
                  onChange={(e) => update("project_number", e.target.value)}
                  placeholder="e.g. 2026-001"
                  required
                />
              </Field>
              <Field label="Project name *">
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Riverside Office Tower"
                  required
                />
              </Field>
            </div>
            <Field label="Client">
              <Input
                value={form.client ?? ""}
                onChange={(e) => update("client", e.target.value)}
                placeholder="Client / owner organization"
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Short description of scope and goals"
                rows={4}
              />
            </Field>

            <div className="space-y-2">
              <Label>Cover image</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingCover}
                  >
                    {uploadingCover ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {form.cover_image_url ? "Replace image" : "Upload image"}
                  </Button>
                  {form.cover_image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => update("cover_image_url", null)}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">JPG/PNG, up to 5MB.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Location & schedule</CardTitle>
            <CardDescription>Where and when the project takes place.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Site address">
              <Input
                value={form.site_address ?? ""}
                onChange={(e) => update("site_address", e.target.value)}
                placeholder="Street, city, postal code"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="GPS latitude">
                <Input
                  type="number"
                  step="any"
                  value={form.gps_lat ?? ""}
                  onChange={(e) =>
                    update("gps_lat", e.target.value === "" ? null : Number(e.target.value))
                  }
                  placeholder="47.3769"
                />
              </Field>
              <Field label="GPS longitude">
                <Input
                  type="number"
                  step="any"
                  value={form.gps_lng ?? ""}
                  onChange={(e) =>
                    update("gps_lng", e.target.value === "" ? null : Number(e.target.value))
                  }
                  placeholder="8.5417"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project type">
                <SelectField
                  value={form.project_type ?? ""}
                  onChange={(v) => update("project_type", v)}
                  options={PROJECT_TYPES}
                  placeholder="Select type"
                />
              </Field>
              <Field label="Building category">
                <SelectField
                  value={form.building_category ?? ""}
                  onChange={(v) => update("building_category", v)}
                  options={BUILDING_CATEGORIES}
                  placeholder="Select category"
                />
              </Field>
              <Field label="Construction phase">
                <SelectField
                  value={form.construction_phase ?? ""}
                  onChange={(v) => update("construction_phase", v)}
                  options={CONSTRUCTION_PHASES}
                  placeholder="Select phase"
                />
              </Field>
              <Field label="Current status">
                <Select
                  value={form.current_status}
                  onValueChange={(v) => update("current_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Contract value (€)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.contract_value ?? ""}
                  onChange={(e) =>
                    update("contract_value", e.target.value === "" ? null : Number(e.target.value))
                  }
                  placeholder="0.00"
                />
              </Field>
              <div />
              <Field label="Planned start">
                <Input
                  type="date"
                  value={form.planned_start ?? ""}
                  onChange={(e) => update("planned_start", e.target.value || null)}
                />
              </Field>
              <Field label="Planned finish">
                <Input
                  type="date"
                  value={form.planned_finish ?? ""}
                  onChange={(e) => update("planned_finish", e.target.value || null)}
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Internal team</CardTitle>
            <CardDescription>Assign the people responsible on your side.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Project manager">
              <Input
                value={form.project_manager ?? ""}
                onChange={(e) => update("project_manager", e.target.value)}
              />
            </Field>
            <Field label="Site manager">
              <Input
                value={form.site_manager ?? ""}
                onChange={(e) => update("site_manager", e.target.value)}
              />
            </Field>
            <Field label="Foreman">
              <Input
                value={form.foreman ?? ""}
                onChange={(e) => update("foreman", e.target.value)}
              />
            </Field>
            <Field label="Safety manager">
              <Input
                value={form.safety_manager ?? ""}
                onChange={(e) => update("safety_manager", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>External contacts</CardTitle>
            <CardDescription>Client side and design consultants.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Client contact">
              <Input
                value={form.client_contact ?? ""}
                onChange={(e) => update("client_contact", e.target.value)}
                placeholder="Name, email or phone"
              />
            </Field>
            <Field label="Architect">
              <Input
                value={form.architect ?? ""}
                onChange={(e) => update("architect", e.target.value)}
              />
            </Field>
            <Field label="Structural engineer">
              <Input
                value={form.structural_engineer ?? ""}
                onChange={(e) => update("structural_engineer", e.target.value)}
              />
            </Field>
            <Field label="MEP engineer">
              <Input
                value={form.mep_engineer ?? ""}
                onChange={(e) => update("mep_engineer", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Internal notes</CardTitle>
            <CardDescription>Private notes for your team. Review before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Notes">
              <Textarea
                value={form.notes ?? ""}
                onChange={(e) => update("notes", e.target.value)}
                rows={6}
                placeholder="Anything else worth remembering about this project."
              />
            </Field>
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="mb-2 font-medium text-foreground">Review</div>
              <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <Review label="Number" value={form.project_number} />
                <Review label="Name" value={form.name} />
                <Review label="Client" value={form.client} />
                <Review label="Status" value={form.current_status} />
                <Review label="Type" value={form.project_type} />
                <Review label="Phase" value={form.construction_phase} />
                <Review label="Start" value={form.planned_start} />
                <Review label="Finish" value={form.planned_finish} />
              </dl>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {step > 0 && (
            <Button type="button" variant="outline" onClick={back}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitLabel}
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
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Review({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-2 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}
