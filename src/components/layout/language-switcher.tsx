import { Languages, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguagePref } from "@/hooks/use-language-pref";
import type { SupportedLanguage } from "@/lib/i18n";

const OPTIONS: { value: SupportedLanguage; label: string; short: string }[] = [
  { value: "de", label: "Deutsch", short: "DE" },
  { value: "en", label: "English", short: "EN" },
];

export function LanguageSwitcher({ variant = "ghost" }: { variant?: "ghost" | "outline" }) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguagePref();
  const current = OPTIONS.find((o) => o.value === language) ?? OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className="h-9 gap-1.5 px-2 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
          aria-label={t("common.language")}
        >
          <Languages className="h-4 w-4" />
          <span>{current.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => setLanguage(o.value)}
            className="flex items-center justify-between"
          >
            <span>{o.label}</span>
            {o.value === language && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
