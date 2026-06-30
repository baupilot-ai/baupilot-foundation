import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import de from "@/locales/de.json";
import en from "@/locales/en.json";

export const SUPPORTED_LANGUAGES = ["de", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = "de";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        de: { translation: de },
        en: { translation: en },
      },
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: "baupilot.lang",
        caches: ["localStorage"],
      },
    });
}

export function setAppLanguage(lang: SupportedLanguage) {
  void i18n.changeLanguage(lang);
  try {
    localStorage.setItem("baupilot.lang", lang);
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  } catch {
    // ignore
  }
}

export function getAppLanguage(): SupportedLanguage {
  const l = (i18n.resolvedLanguage ?? i18n.language ?? DEFAULT_LANGUAGE).slice(0, 2);
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(l) ? (l as SupportedLanguage) : DEFAULT_LANGUAGE;
}

export function formatDate(value: string | number | Date | null | undefined, lang?: SupportedLanguage) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const locale = (lang ?? getAppLanguage()) === "de" ? "de-DE" : "en-US";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function formatCurrency(value: number | null | undefined, currency = "EUR", lang?: SupportedLanguage) {
  if (value == null || Number.isNaN(value)) return "";
  const locale = (lang ?? getAppLanguage()) === "de" ? "de-DE" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export default i18n;
