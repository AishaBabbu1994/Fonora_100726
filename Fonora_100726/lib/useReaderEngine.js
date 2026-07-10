"use client";

import { useCallback, useRef, useState } from "react";
import { findChunkForWord } from "./textChunker";

// status: "idle" | "playing" | "buffering"
export function useReaderEngine({
  tokens,
  chunks,
  engine, // "browser" | "groq"
  browserVoice, // objeto SpeechSynthesisVoice o null
  groqModel, // string
  groqVoice, // string
  apiKey,
  rate,
  pitch,
  pauseSeconds,
  repeatMinutes, // null = sin repetición, 0 = infinita, N = minutos
}) {
  const [status, setStatus] = useState("idle");
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [activeChunkIndex, setActiveChunkIndex] = useState(null);
  const [error, setError] = useState(null);

  const stopFlagRef = useRef(true);
  const audioRef = useRef(null);
  const cycleStartRef = useRef(null);
  const runIdRef = useRef(0);

  const shouldRepeat = useCallback(() => {
    if (repeatMinutes === null || repeatMinutes === undefined) return false;
    if (repeatMinutes === 0) return true;
    const elapsedMin = (Date.now() - cycleStartRef.current) / 60000;
    return elapsedMin < repeatMinutes;
  }, [repeatMinutes]);

  const stop = useCallback(() => {
    stopFlagRef.current = true;
    runIdRef.current += 1;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setStatus("idle");
    setActiveWordIndex(null);
    setActiveChunkIndex(null);
  }, []);

  const words = tokens.filter((t) => t.type === "word");

  const playBrowser = useCallback(
    (fromWordIndex, myRunId) => {
      const startPos = Math.max(
        0,
        words.findIndex((w) => w.index === fromWordIndex)
      );

      function speakFrom(pos) {
        if (stopFlagRef.current || myRunId !== runIdRef.current) return;
        if (pos >= words.length) {
          if (shouldRepeat()) {
            setTimeout(() => {
              if (stopFlagRef.current || myRunId !== runIdRef.current) return;
              speakFrom(0);
            }, 500);
          } else {
            setStatus("idle");
            setActiveWordIndex(null);
          }
          return;
        }
        const word = words[pos];
        setActiveWordIndex(word.index);
        const utterance = new SpeechSynthesisUtterance(word.text);
        if (browserVoice) {
          utterance.voice = browserVoice;
          utterance.lang = browserVoice.lang;
        }
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.onend = () => {
          if (stopFlagRef.current || myRunId !== runIdRef.current) return;
          if (pauseSeconds > 0) {
            setTimeout(() => speakFrom(pos + 1), pauseSeconds * 1000);
          } else {
            speakFrom(pos + 1);
          }
        };
        utterance.onerror = () => {
          if (stopFlagRef.current || myRunId !== runIdRef.current) return;
          speakFrom(pos + 1);
        };
        window.speechSynthesis.speak(utterance);
      }

      speakFrom(startPos);
    },
    [words, browserVoice, rate, pitch, pauseSeconds, shouldRepeat]
  );

  const playGroqChunk = useCallback(
    async (chunkIndex, myRunId) => {
      if (stopFlagRef.current || myRunId !== runIdRef.current) return;

      if (chunkIndex >= chunks.length) {
        if (shouldRepeat()) {
          setTimeout(() => {
            if (stopFlagRef.current || myRunId !== runIdRef.current) return;
            playGroqChunk(0, myRunId);
          }, 500);
        } else {
          setStatus("idle");
          setActiveChunkIndex(null);
        }
        return;
      }

      const chunk = chunks[chunkIndex];
      setActiveChunkIndex(chunkIndex);
      setStatus("buffering");

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            model: groqModel,
            voice: groqVoice,
            input: chunk.text,
            responseFormat: "wav",
          }),
        });

        if (stopFlagRef.current || myRunId !== runIdRef.current) return;

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Error de Groq (${res.status})`);
        }

        const blob = await res.blob();
        if (stopFlagRef.current || myRunId !== runIdRef.current) return;

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = rate;
        audioRef.current = audio;
        setStatus("playing");

        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (stopFlagRef.current || myRunId !== runIdRef.current) return;
          if (pauseSeconds > 0) {
            setTimeout(() => playGroqChunk(chunkIndex + 1, myRunId), pauseSeconds * 1000);
          } else {
            playGroqChunk(chunkIndex + 1, myRunId);
          }
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          if (stopFlagRef.current || myRunId !== runIdRef.current) return;
          playGroqChunk(chunkIndex + 1, myRunId);
        };

        await audio.play();
      } catch (e) {
        setError(e.message || "No se ha podido generar el audio con Groq.");
        setStatus("idle");
        setActiveChunkIndex(null);
      }
    },
    [chunks, apiKey, groqModel, groqVoice, rate, pauseSeconds, shouldRepeat]
  );

  const play = useCallback(
    (fromWordIndex = 0) => {
      setError(null);
      stopFlagRef.current = true; // corta cualquier ciclo anterior
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      runIdRef.current += 1;
      const myRunId = runIdRef.current;
      stopFlagRef.current = false;
      cycleStartRef.current = Date.now();
      setStatus("playing");

      if (engine === "groq") {
        const startChunk = findChunkForWord(chunks, fromWordIndex);
        playGroqChunk(startChunk, myRunId);
      } else {
        playBrowser(fromWordIndex, myRunId);
      }
    },
    [engine, chunks, playGroqChunk, playBrowser]
  );

  return {
    status,
    activeWordIndex,
    activeChunkIndex,
    error,
    play,
    stop,
  };
}
