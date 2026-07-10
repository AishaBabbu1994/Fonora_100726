"use client";

import { useMemo } from "react";
import { t } from "@/lib/i18n";

export default function InteractiveReader({
  locale,
  tokens,
  chunks,
  engine,
  activeWordIndex,
  activeChunkIndex,
  onWordClick,
}) {
  const wordToChunk = useMemo(() => {
    const map = new Map();
    if (engine !== "groq") return map;
    for (const c of chunks) {
      for (let i = c.startIndex; i <= c.endIndex; i++) map.set(i, c.id);
    }
    return map;
  }, [chunks, engine]);

  if (!tokens.length) {
    return (
      <div className="border border-dashed border-line rounded-lg px-4 py-10 text-center text-muted text-sm">
        {t(locale, "paste_placeholder")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">{t(locale, "reader_hint")}</p>
      <div className="bg-surface border border-line rounded-lg px-4 py-4 text-lg leading-loose font-body">
        {tokens.map((tok, i) => {
          if (tok.type === "space") return <span key={i}>{tok.text}</span>;
          const isActive =
            engine === "groq"
              ? wordToChunk.get(tok.index) === activeChunkIndex &&
                activeChunkIndex !== null
              : activeWordIndex === tok.index;
          return (
            <span
              key={i}
              className={`word ${isActive ? "is-active" : ""}`}
              onClick={() => onWordClick(tok.index)}
            >
              {tok.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
