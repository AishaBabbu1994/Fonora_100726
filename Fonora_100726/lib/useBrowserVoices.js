"use client";

import { useEffect, useState } from "react";

export function useBrowserVoices() {
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    function loadVoices() {
      const list = window.speechSynthesis.getVoices();
      if (list && list.length) setVoices(list);
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  return voices;
}

// Agrupa las voces del navegador por idioma (BCP-47 simplificado a "es", "en"...)
// para que el selector muestre secciones legibles en vez de una lista plana.
export function groupVoicesByLang(voices) {
  const groups = {};
  for (const v of voices) {
    const lang = (v.lang || "und").split("-")[0];
    if (!groups[lang]) groups[lang] = [];
    groups[lang].push(v);
  }
  return groups;
}
