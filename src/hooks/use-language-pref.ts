import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { setAppLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage, DEFAULT_LANGUAGE } from "@/lib/i18n";

/**
 * Language preference hook. Returns the current language (reactive) and a
 * setter that updates i18n immediately and persists to the user's profile.
 */
export function useLanguagePref() {
  const { i18n } = useTranslation();
  const raw = (i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LANGUAGE).slice(0, 2);
  const language: SupportedLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(raw)
    ? (raw as SupportedLanguage)
    : DEFAULT_LANGUAGE;

  async function setLanguage(next: SupportedLanguage) {
    setAppLanguage(next);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ language: next }).eq("id", user.id);
      }
    } catch {
      // non-fatal — language is already applied locally
    }
  }

  return { language, setLanguage };
}
