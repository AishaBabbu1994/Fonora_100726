"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useBrowserVoices, groupVoicesByLang } from "@/lib/useBrowserVoices";
import { useReaderEngine } from "@/lib/useReaderEngine";
import { tokenize, countWords, buildChunks } from "@/lib/textChunker";
import { GROQ_MAX_CHARS, getGroqEngine } from "@/lib/groqVoices";
import { t } from "@/lib/i18n";

import Header from "@/components/Header";
import ApiKeyBar from "@/components/ApiKeyBar";
import TextInput from "@/components/TextInput";
import InteractiveReader from "@/components/InteractiveReader";
import ControlsPanel from "@/components/ControlsPanel";
import HistoryPanel from "@/components/HistoryPanel";
import ExportPdfButton from "@/components/ExportPdfButton";

export default function Page() {
  const [locale, setLocale] = useLocalStorage("vozora:locale", "es");
  const [apiKey, setApiKey] = useLocalStorage("vozora:groq_api_key", "");
  const [history, setHistory] = useLocalStorage("vozora:history", []);

  const [text, setText] = useState("");
  const [engine, setEngine] = useState("browser");

  const [groqEngineId, setGroqEngineId] = useState("groq-en");
  const [groqVoiceId, setGroqVoiceId] = useState("autumn");

  const browserVoices = useBrowserVoices();
  const browserLangGroups = useMemo(
    () => groupVoicesByLang(browserVoices),
    [browserVoices]
  );
  const [browserLang, setBrowserLang] = useState("es");
  const [browserVoiceURI, setBrowserVoiceURI] = useState("");

  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [pauseSeconds, setPauseSeconds] = useState(0);
  const [repeatMinutes, setRepeatMinutes] = useState(null);

  // Si el idioma de navegador elegido no tiene voces disponibles, cae al primero que sí tenga.
  useEffect(() => {
    const keys = Object.keys(browserLangGroups);
    if (keys.length === 0) return;
    if (!browserLangGroups[browserLang]) {
      setBrowserLang(keys.includes("es") ? "es" : keys[0]);
    }
  }, [browserLangGroups, browserLang]);

  // Mantiene la voz seleccionada sincronizada con el idioma elegido.
  useEffect(() => {
    const list = browserLangGroups[browserLang] || [];
    if (list.length === 0) return;
    const stillValid = list.some((v) => v.voiceURI === browserVoiceURI);
    if (!stillValid) setBrowserVoiceURI(list[0].voiceURI);
  }, [browserLangGroups, browserLang, browserVoiceURI]);

  // Al cambiar de motor Groq (inglés/árabe), selecciona la primera voz válida.
  useEffect(() => {
    const eng = getGroqEngine(groqEngineId);
    if (!eng.voices.some((v) => v.id === groqVoiceId)) {
      setGroqVoiceId(eng.voices[0].id);
    }
  }, [groqEngineId, groqVoiceId]);

  const tokens = useMemo(() => tokenize(text), [text]);
  const wordCount = useMemo(() => countWords(tokens), [tokens]);
  const chunks = useMemo(
    () => buildChunks(tokens, GROQ_MAX_CHARS),
    [tokens]
  );

  const selectedBrowserVoice = useMemo(
    () => browserVoices.find((v) => v.voiceURI === browserVoiceURI) || null,
    [browserVoices, browserVoiceURI]
  );

  const groqEngine = getGroqEngine(groqEngineId);
  const apiKeyMissing = !apiKey || !apiKey.trim();

  const reader = useReaderEngine({
    tokens,
    chunks,
    engine,
    browserVoice: selectedBrowserVoice,
    groqModel: groqEngine.model,
    groqVoice: groqVoiceId,
    apiKey,
    rate,
    pitch,
    pauseSeconds,
    repeatMinutes,
  });

  function saveToHistory() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      if (prev[0]?.text === trimmed) return prev;
      const entry = { id: Date.now(), text: trimmed, date: Date.now(), engine };
      return [entry, ...prev].slice(0, 20);
    });
  }

  function handlePlay(fromWordIndex) {
    if (!text.trim()) return;
    if (engine === "groq" && apiKeyMissing) return;
    saveToHistory();
    reader.play(fromWordIndex);
  }

  function handleWordClick(index) {
    handlePlay(index);
  }

  function handleHistoryLoad(item) {
    reader.stop();
    setText(item.text);
  }

  function handleHistoryDelete(id) {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }

  function handleHistoryClear() {
    setHistory([]);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <Header locale={locale} setLocale={setLocale} />

      <ApiKeyBar locale={locale} apiKey={apiKey} setApiKey={setApiKey} />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <TextInput
            locale={locale}
            text={text}
            setText={setText}
            wordCount={wordCount}
          />

          <InteractiveReader
            locale={locale}
            tokens={tokens}
            chunks={chunks}
            engine={engine}
            activeWordIndex={reader.activeWordIndex}
            activeChunkIndex={reader.activeChunkIndex}
            onWordClick={handleWordClick}
          />

          {reader.error && (
            <p className="text-sm text-stop bg-surface2 border border-stop rounded-md px-3 py-2">
              {reader.error}
            </p>
          )}

          <ControlsPanel
            locale={locale}
            engine={engine}
            setEngine={setEngine}
            groqEngineId={groqEngineId}
            setGroqEngineId={setGroqEngineId}
            groqVoiceId={groqVoiceId}
            setGroqVoiceId={setGroqVoiceId}
            browserLangGroups={browserLangGroups}
            browserLang={browserLang}
            setBrowserLang={setBrowserLang}
            browserVoiceURI={browserVoiceURI}
            setBrowserVoiceURI={setBrowserVoiceURI}
            rate={rate}
            setRate={setRate}
            pitch={pitch}
            setPitch={setPitch}
            pauseSeconds={pauseSeconds}
            setPauseSeconds={setPauseSeconds}
            repeatMinutes={repeatMinutes}
            setRepeatMinutes={setRepeatMinutes}
            status={reader.status}
            onPlay={handlePlay}
            onStop={reader.stop}
            apiKeyMissing={apiKeyMissing}
          />

          <div className="flex justify-end">
            <ExportPdfButton locale={locale} text={text} title={t(locale, "hero_title")} />
          </div>
        </div>

        <div className="space-y-6">
          <HistoryPanel
            locale={locale}
            history={history}
            onLoad={handleHistoryLoad}
            onDelete={handleHistoryDelete}
            onClear={handleHistoryClear}
          />
        </div>
      </div>

      <footer className="text-xs text-muted border-t border-line pt-6">
        {t(locale, "footer_note")}
      </footer>
    </main>
  );
}
