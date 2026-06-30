import { supabase } from "@/integrations/supabase/client";

export interface CompanyRow {
  id: string;
  name: string;
  industry: string | null;
  company_size: string | null;
  address: string | null;
  vat_id: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyUpdate = Partial<Omit<CompanyRow, "id" | "created_at" | "updated_at">>;

export async function getMyCompany(): Promise<CompanyRow | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.company_id) return null;
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .maybeSingle();
  if (error) throw error;
  return (data as CompanyRow) ?? null;
}

export async function updateCompany(id: string, patch: CompanyUpdate) {
  const { data, error } = await supabase
    .from("companies")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CompanyRow;
}

export async function uploadCompanyLogo(companyId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${companyId}/logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("company-logos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getLogoSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("company-logos")
    .createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}
