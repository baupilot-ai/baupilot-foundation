import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TRADES, INSURANCE_STATUS, QUALIFICATION_STATUS, SUBCONTRACTOR_STATUS,
  createSubcontractor, updateSubcontractor, type Subcontractor,
} from "@/lib/team";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subcontractor?: Subcontractor | null;
  onSaved?: () => void;
}

const empty = {
  company_name: "", trade: "general", contact_person: "", email: "", phone: "",
  address: "", tax_number: "", insurance_status: "unknown",
  qualification_status: "not_checked", rating: 0, status: "active", notes: "",
};

export function SubcontractorDialog({ open, onOpenChange, subcontractor, onSaved }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subcontractor) {
      setForm({
        company_name: subcontractor.company_name,
        trade: subcontractor.trade ?? "general",
        contact_person: subcontractor.contact_person ?? "",
        email: subcontractor.email ?? "",
        phone: subcontractor.phone ?? "",
        address: subcontractor.address ?? "",
        tax_number: subcontractor.tax_number ?? "",
        insurance_status: subcontractor.insurance_status,
        qualification_status: subcontractor.qualification_status,
        rating: subcontractor.rating ?? 0,
        status: subcontractor.status,
        notes: subcontractor.notes ?? "",
      });
    } else setForm(empty);
  }, [subcontractor, open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        contact_person: form.contact_person || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        tax_number: form.tax_number || null,
        rating: form.rating || null,
        notes: form.notes || null,
      };
      if (subcontractor) await updateSubcontractor(subcontractor.id, payload);
      else await createSubcontractor(payload);
      toast.success(subcontractor ? t("team.toasts.subcontractorUpdated") : t("team.toasts.subcontractorAdded"));
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("states.failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{subcontractor ? t("team.dialogs.editSubcontractor") : t("team.dialogs.addSubcontractorTitle")}</DialogTitle>
          <DialogDescription>{t("team.dialogs.subcontractorDetails")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("team.fields.companyName")} *</Label>
            <Input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("team.fields.trade")}</Label>
            <Select value={form.trade} onValueChange={(v) => setForm({ ...form, trade: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRADES.map((r) => <SelectItem key={r.value} value={r.value}>{t(r.label)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("team.fields.contactPerson")}</Label>
            <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("team.fields.email")}</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("team.fields.phone")}</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("team.fields.address")}</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("team.fields.taxNumber")}</Label>
            <Input value={form.tax_number} onChange={(e) => setForm({ ...form, tax_number: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("team.fields.status")}</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBCONTRACTOR_STATUS.map((r) => <SelectItem key={r.value} value={r.value}>{t(r.label)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("team.fields.insuranceStatus")}</Label>
            <Select value={form.insurance_status} onValueChange={(v) => setForm({ ...form, insurance_status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INSURANCE_STATUS.map((r) => <SelectItem key={r.value} value={r.value}>{t(r.label)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("team.fields.qualificationStatus")}</Label>
            <Select value={form.qualification_status} onValueChange={(v) => setForm({ ...form, qualification_status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUALIFICATION_STATUS.map((r) => <SelectItem key={r.value} value={r.value}>{t(r.label)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("team.fields.rating")}</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: form.rating === n ? 0 : n })}
                  className="p-1"
                  aria-label={t("team.fields.starsAria", { n })}
                >
                  <Star className={cn("h-6 w-6", n <= form.rating ? "fill-warning text-warning" : "text-muted-foreground")} />
                </button>
              ))}
              {form.rating > 0 && (
                <button type="button" className="ml-2 text-xs text-muted-foreground hover:underline"
                  onClick={() => setForm({ ...form, rating: 0 })}>
                  {t("team.fields.clear")}
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("team.fields.notes")}</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {subcontractor ? t("team.actions.saveChanges") : t("team.actions.addSubcontractor")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
