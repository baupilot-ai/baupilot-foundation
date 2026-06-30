import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { setAppLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";

export type Profile = Tables<"profiles">;

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (alive) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (!alive) return;
      setProfile(data);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return { profile, loading };
}

export function profileDisplayName(p: Profile | null, fallback?: string) {
  if (!p) return fallback ?? "";
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return name || p.email || fallback || "";
}

export function profileInitials(p: Profile | null, fallbackEmail?: string) {
  if (p?.first_name || p?.last_name) {
    return ((p.first_name?.[0] ?? "") + (p.last_name?.[0] ?? "")).toUpperCase();
  }
  const e = p?.email ?? fallbackEmail ?? "";
  return e ? e.slice(0, 2).toUpperCase() : "BP";
}
