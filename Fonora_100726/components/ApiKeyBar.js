"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

export default function ApiKeyBar({ locale, apiKey, setApiKey }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="bg-surface2 border border-line rounded-lg px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
      <label className="text-xs font-mono uppercase tracking-wide text-muted whitespace-nowrap">
        {t(locale, "apikey_label")}
      </label>
      <div className="flex-1 flex items-center gap-2">
        <input
          type={visible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={t(locale, "apikey_placeholder")}
          className="flex-1 min-w-0 bg-surface border border-line rounded-md px-2.5 py-1.5 text-sm font-mono text-ink placeholder:text-muted"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={() => setVisible((v) => !v)}
          className="text-xs font-mono text-muted hover:text-ink px-2 py-1.5 border border-line rounded-md whitespace-nowrap"
          type="button"
        >
          {visible ? t(locale, "apikey_hide") : t(locale, "apikey_show")}
        </button>
      </div>
      <a
        href="https://console.groq.com/keys"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-ai hover:underline whitespace-nowrap"
      >
        {t(locale, "apikey_get_link")}
      </a>
    </div>
  );
}
