"use client";

import { t } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function Header({ locale, setLocale }) {
  return (
    <header className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-ai mb-1">
          {t(locale, "brand_tag")}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink">
          {t(locale, "hero_title")}
        </h1>
        <p className="text-sm text-muted mt-2 max-w-xl">{t(locale, "hero_sub")}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <LanguageSwitcher locale={locale} onChange={setLocale} />
        <ThemeToggle locale={locale} />
      </div>
    </header>
  );
}
