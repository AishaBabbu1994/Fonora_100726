"use client";

import { t } from "@/lib/i18n";
import { GROQ_ENGINES } from "@/lib/groqVoices";

function WaveformIndicator({ active }) {
  const heights = [10, 18, 14, 22, 12];
  return (
    <div className="flex items-end gap-0.5 h-6" aria-hidden="true">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`waveform-bar ${active ? "animate-pulseBar" : ""}`}
          style={{
            height: active ? `${h}px` : "4px",
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function ControlsPanel({
  locale,
  engine,
  setEngine,
  groqEngineId,
  setGroqEngineId,
  groqVoiceId,
  setGroqVoiceId,
  browserLangGroups,
  browserLang,
  setBrowserLang,
  browserVoiceURI,
  setBrowserVoiceURI,
  rate,
  setRate,
  pitch,
  setPitch,
  pauseSeconds,
  setPauseSeconds,
  repeatMinutes,
  setRepeatMinutes,
  status,
  onPlay,
  onStop,
  apiKeyMissing,
}) {
  const groqEngine = GROQ_ENGINES.find((e) => e.id === groqEngineId) || GROQ_ENGINES[0];
  const voicesForBrowserLang = browserLangGroups[browserLang] || [];

  return (
    <div className="bg-surface border border-line rounded-xl p-4 space-y-4 shadow-dial">
      {/* Motor de voz */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wide text-muted mr-1">
          {t(locale, "engine_label")}
        </span>
        <button
          type="button"
          onClick={() => setEngine("browser")}
          className={`text-xs px-3 py-1.5 rounded-full border ${
            engine === "browser"
              ? "bg-ink text-page border-ink"
              : "border-line text-muted"
          }`}
        >
          {t(locale, "engine_browser")}
        </button>
        <button
          type="button"
          onClick={() => setEngine("groq")}
          className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 ${
            engine === "groq"
              ? "bg-ai text-page border-ai"
              : "border-line text-muted"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {t(locale, "engine_groq")}
        </button>
      </div>

      {apiKeyMissing && engine === "groq" && (
        <p className="text-xs text-stop">{t(locale, "apikey_missing")}</p>
      )}

      {/* Idioma + voz */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted block mb-1">
            {t(locale, "lang_label")}
          </label>
          {engine === "groq" ? (
            <select
              value={groqEngineId}
              onChange={(e) => setGroqEngineId(e.target.value)}
              className="w-full bg-surface2 border border-line rounded-md px-2.5 py-1.5 text-sm text-ink"
            >
              {GROQ_ENGINES.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {t(locale, eng.langKey)}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={browserLang}
              onChange={(e) => setBrowserLang(e.target.value)}
              className="w-full bg-surface2 border border-line rounded-md px-2.5 py-1.5 text-sm text-ink"
            >
              {Object.keys(browserLangGroups)
                .sort()
                .map((code) => (
                  <option key={code} value={code}>
                    {code.toUpperCase()}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted block mb-1">
            {t(locale, "voice_label")}
          </label>
          {engine === "groq" ? (
            <select
              value={groqVoiceId}
              onChange={(e) => setGroqVoiceId(e.target.value)}
              className="w-full bg-surface2 border border-line rounded-md px-2.5 py-1.5 text-sm text-ink"
            >
              {groqEngine.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={browserVoiceURI}
              onChange={(e) => setBrowserVoiceURI(e.target.value)}
              className="w-full bg-surface2 border border-line rounded-md px-2.5 py-1.5 text-sm text-ink"
            >
              {voicesForBrowserLang.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tira de dial: velocidad, tono, pausa, repetición */}
      <div className="grid sm:grid-cols-2 gap-4 pt-1">
        <div>
          <div className="flex justify-between text-xs font-mono text-muted mb-1">
            <span>{t(locale, "speed_label")}</span>
            <span>{rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            className="dial"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-muted mb-1">
            <span>{t(locale, "pitch_label")}</span>
            <span>{engine === "groq" ? "—" : pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            className="dial disabled:opacity-40"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            disabled={engine === "groq"}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
          />
          {engine === "groq" && (
            <p className="text-[11px] text-muted mt-1">
              {t(locale, "pitch_disabled_note")}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-muted mb-1">
            <span>
              {engine === "groq"
                ? t(locale, "pause_chunks_label")
                : t(locale, "pause_words_label")}
            </span>
            <span>{pauseSeconds.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            className="dial"
            min="0"
            max="5"
            step="0.1"
            value={pauseSeconds}
            onChange={(e) => setPauseSeconds(parseFloat(e.target.value))}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-muted mb-1">
            <span>{t(locale, "repeat_label")}</span>
            <span>
              {repeatMinutes === null
                ? "—"
                : repeatMinutes === 0
                ? t(locale, "repeat_infinite_active")
                : `${repeatMinutes} ${t(locale, "repeat_minutes")}`}
            </span>
          </div>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="—"
            value={repeatMinutes === null ? "" : repeatMinutes}
            onChange={(e) =>
              setRepeatMinutes(
                e.target.value === "" ? null : Math.max(0, parseInt(e.target.value, 10) || 0)
              )
            }
            className="w-full bg-surface2 border border-line rounded-md px-2.5 py-1.5 text-sm text-ink font-mono"
          />
          <p className="text-[11px] text-muted mt-1">
            {t(locale, "repeat_infinite_hint")}
          </p>
        </div>
      </div>

      {/* Transporte */}
      <div className="flex items-center justify-between pt-2 border-t border-line">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPlay(0)}
            disabled={engine === "groq" && apiKeyMissing}
            className="px-4 py-2 rounded-md bg-mark text-mark-ink text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t(locale, "play_button")}
          </button>
          <button
            type="button"
            onClick={onStop}
            className="px-4 py-2 rounded-md border border-line text-sm font-medium text-ink hover:bg-surface2"
          >
            {t(locale, "stop_button")}
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <WaveformIndicator active={status === "playing"} />
          <span>
            {status === "playing"
              ? t(locale, "status_playing")
              : status === "buffering"
              ? "…"
              : t(locale, "status_idle")}
          </span>
        </div>
      </div>
    </div>
  );
}
