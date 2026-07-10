"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Volume2, VolumeX, Moon, Sun, FileText, 
  Trash2, Key, Globe, Play, Square, Download 
} from "lucide-react";

interface HistoryItem {
  id: string;
  text: string;
  lang: string;
  date: string;
}

export default function VoxArchiva() {
  // Estados principales
  const [apiKey, setApiKey] = useState("");
  const [text, setText] = useState("");
  const [lang, setLang] = useState("es-ES");
  const [rate, setRate] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedText, setHighlightedText] = useState("");

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Inicialización y persistencia
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const savedKey = localStorage.getItem("vox_groq_key") || "";
    const savedHistory = localStorage.getItem("vox_history") || "[]";
    const savedTheme = localStorage.getItem("vox_theme") || "dark";
    
    setApiKey(savedKey);
    setHistory(JSON.parse(savedHistory));
    setDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("vox_groq_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("vox_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("vox_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Manejo de la selección de texto para sombreado
  const handleTextSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim().length > 0) {
      setHighlightedText(selection.trim());
    } else {
      setHighlightedText("");
    }
  };

  // Función para procesar texto con Groq (Optimización para lectura)
  const processTextWithGroq = async (textToProcess: string) => {
    if (!apiKey) return textToProcess; // Si no hay key, usa el texto original

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "Eres un asistente que optimiza textos para ser leídos por un software de Text-to-Speech. Corrige puntuaciones, añade comas donde falten pausas naturales y limpia carácteres extraños. Devuelve SOLO el texto limpio, sin introducciones ni comentarios."
            },
            { role: "user", content: textToProcess }
          ],
          temperature: 0.3
        })
      });
      const data = await response.json();
      return data.choices[0]?.message?.content || textToProcess;
    } catch (error) {
      console.error("Error con Groq API:", error);
      return textToProcess;
    }
  };

  // Control de reproducción de voz
  const handleSpeak = async () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }

    // Prioriza el fragmento sombreado/seleccionado por el usuario
    const textToRead = highlightedText || text;
    if (!textToRead.trim()) return;

    setIsPlaying(true);
    
    // Optimización opcional por IA
    const optimizedText = await processTextWithGroq(textToRead);

    utteranceRef.current = new SpeechSynthesisUtterance(optimizedText);
    utteranceRef.current.lang = lang;
    utteranceRef.current.rate = rate;

    utteranceRef.current.onend = () => {
      setIsPlaying(false);
    };

    utteranceRef.current.onerror = () => {
      setIsPlaying(false);
    };

    // Agregar al historial
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      text: textToRead.substring(0, 60) + (textToRead.length > 60 ? "..." : ""),
      lang: lang,
      date: new Date().toLocaleDateString()
    };
    setHistory([newItem, ...history.filter(h => h.text !== newItem.text)].slice(0, 10));

    synthRef.current.speak(utteranceRef.current);
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  // Exportar a PDF (Simulado nativo vía impresión limpia)
  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-slate-900"}`}>
      
      {/* BARRA SUPERIOR (API KEY & CONFIG) */}
      <header className="border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 bg-opacity-80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-indigo-500" />
            <span className="font-bold text-xl tracking-tight">VoxArchiva</span>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative flex items-center w-full max-w-xs">
              <Key className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="Pegar Groq API Key (gsk_...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              aria-label="Cambiar tema"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
        
        {/* PANEL DE CONTROL Y TEXTO */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            
            {/* Selector de Idiomas */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="es-ES" className="dark:bg-slate-900">Español (ES)</option>
                <option value="en-US" className="dark:bg-slate-900">English (US)</option>
                <option value="fr-FR" className="dark:bg-slate-900">Français (FR)</option>
                <option value="zh-CN" className="dark:bg-slate-900">中文 (Chinese)</option>
                <option value="pt-PT" className="dark:bg-slate-900">Português (PT)</option>
              </select>
            </div>

            {/* Selector de Velocidad */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Velocidad:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-mono w-8">{rate}x</span>
            </div>

            {/* Acciones secundarias */}
            <button
              onClick={exportToPDF}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
          </div>

          {/* Área de Texto Principal */}
          <div className="relative flex-1 min-h-[350px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              placeholder="Escribe o pega tu texto aquí... Selecciona cualquier fragmento con el ratón si solo deseas reproducir esa parte específica."
              className="w-full h-full min-h-[300px] bg-transparent resize-none focus:outline-none text-base leading-relaxed"
            />
            
            {/* Indicador de Sombreado Activo */}
            {highlightedText && (
              <div className="absolute bottom-4 left-4 right-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs px-3 py-2 rounded-lg flex items-center justify-between">
                <span>Fragmento seleccionado listo para reproducir ({highlightedText.length} caract.)</span>
                <button onClick={() => setHighlightedText("")} className="underline hover:text-indigo-300">Borrar selección</button>
              </div>
            )}
          </div>

          {/* Botones de Reproducción */}
          <div className="flex gap-3">
            <button
              onClick={handleSpeak}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium shadow-md transition-all ${
                isPlaying 
                ? "bg-amber-500 hover:bg-amber-600 text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isPlaying ? <VolumeX className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isPlaying ? "Pausar / Detener Voz" : highlightedText ? "Reproducir Selección" : "Optimizar con Groq & Leer"}
            </button>
            
            {isPlaying && (
              <button
                onClick={handleStop}
                className="px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition"
              >
                <Square className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* HISTORIAL LATERAL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-semibold text-sm text-slate-400">
              <FileText className="h-4 w-4" />
              <span>Textos Recientes</span>
            </div>
            {history.length > 0 && (
              <button 
                onClick={() => setHistory([])}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Limpiar
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No hay lecturas guardadas todavía.</p>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setText(item.text.replace("...", ""))}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 hover:border-indigo-500/40 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer transition text-xs flex flex-col gap-1"
                >
                  <p className="line-clamp-2 text-slate-300 font-medium">{item.text}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span>{item.lang.split("-")[0].toUpperCase()}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}