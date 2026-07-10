// Groq (Orpheus) solo ofrece hoy dos idiomas: inglés y árabe (dialecto saudí).
// Límite real de la API: 200 caracteres por petición, formato de salida wav.
// Ver /README.md para más contexto sobre esta limitación.

export const GROQ_MAX_CHARS = 190; // margen de seguridad bajo el límite real (200)

export const GROQ_ENGINES = [
  {
    id: "groq-en",
    model: "canopylabs/orpheus-v1-english",
    langKey: "groq_lang_en",
    bcp47: "en-US",
    voices: [
      { id: "autumn", label: "Autumn" },
      { id: "diana", label: "Diana" },
      { id: "hannah", label: "Hannah" },
      { id: "austin", label: "Austin" },
      { id: "daniel", label: "Daniel" },
      { id: "troy", label: "Troy" },
    ],
  },
  {
    id: "groq-ar",
    model: "canopylabs/orpheus-arabic-saudi",
    langKey: "groq_lang_ar",
    bcp47: "ar-SA",
    voices: [
      { id: "abdullah", label: "Abdullah" },
      { id: "fahad", label: "Fahad" },
      { id: "sultan", label: "Sultan" },
      { id: "lulwa", label: "Lulwa" },
      { id: "noura", label: "Noura" },
      { id: "aisha", label: "Aisha" },
    ],
  },
];

export function getGroqEngine(id) {
  return GROQ_ENGINES.find((e) => e.id === id) || GROQ_ENGINES[0];
}
