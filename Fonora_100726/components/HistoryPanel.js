"use client";

import { t } from "@/lib/i18n";

export default function HistoryPanel({ locale, history, onLoad, onDelete, onClear }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">{t(locale, "history_title")}</h2>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-stop hover:underline"
            type="button"
          >
            {t(locale, "history_clear")}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted">{t(locale, "history_empty")}</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {history.map((item) => (
            <li
              key={item.id}
              className="border border-line rounded-lg px-3 py-2 flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{item.text.slice(0, 80)}</p>
                <p className="text-[11px] font-mono text-muted">
                  {new Date(item.date).toLocaleString(locale)}
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => onLoad(item)}
                  className="text-xs text-ai hover:underline"
                  type="button"
                >
                  {t(locale, "history_load")}
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-xs text-stop hover:underline"
                  type="button"
                >
                  {t(locale, "history_delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
