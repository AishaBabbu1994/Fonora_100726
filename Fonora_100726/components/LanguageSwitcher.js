"use client";

import { LOCALES } from "@/lib/i18n";

export default function LanguageSwitcher({ locale, onChange }) {
  return (
    <select
      value={locale}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface border border-line rounded-md px-2 py-1.5 text-sm font-mono text-ink"
      aria-label="Idioma de la interfaz / Interface language"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
