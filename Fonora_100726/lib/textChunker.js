// Convierte el texto libre en una lista de tokens (palabras + espacios),
// preservando el espaciado original para poder re-renderizarlo tal cual.
export function tokenize(text) {
  const parts = (text || "").split(/(\s+)/);
  const tokens = [];
  let wordIndex = 0;
  for (const part of parts) {
    if (part === "") continue;
    if (/^\s+$/.test(part)) {
      tokens.push({ type: "space", text: part });
    } else {
      tokens.push({ type: "word", text: part, index: wordIndex });
      wordIndex++;
    }
  }
  return tokens;
}

export function countWords(tokens) {
  return tokens.reduce((acc, t) => acc + (t.type === "word" ? 1 : 0), 0);
}

// Agrupa los tokens en fragmentos de como máximo `maxChars` caracteres,
// cortando siempre en un espacio (nunca a mitad de palabra). Cada fragmento
// guarda el rango de índices de palabra que contiene, para poder saber a qué
// fragmento pertenece la palabra en la que el usuario ha hecho clic.
export function buildChunks(tokens, maxChars) {
  const chunks = [];
  let current = { text: "", startIndex: null, endIndex: null };

  for (const tok of tokens) {
    const wouldOverflow = current.text.length + tok.text.length > maxChars;
    if (wouldOverflow && current.text.trim().length > 0) {
      chunks.push(current);
      current = { text: "", startIndex: null, endIndex: null };
    }
    if (tok.type === "word") {
      if (current.startIndex === null) current.startIndex = tok.index;
      current.endIndex = tok.index;
    }
    current.text += tok.text;
  }
  if (current.text.trim().length > 0) chunks.push(current);

  return chunks
    .map((c, i) => ({ ...c, text: c.text.trim(), id: i }))
    .filter((c) => c.text.length > 0);
}

export function findChunkForWord(chunks, wordIndex) {
  const found = chunks.findIndex(
    (c) => wordIndex >= c.startIndex && wordIndex <= c.endIndex
  );
  return found === -1 ? 0 : found;
}
