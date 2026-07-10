// Este endpoint es un simple "proxy" hacia la API de Groq.
// La API key viaja en el cuerpo de la petición (nunca se guarda ni se loguea
// en el servidor) porque en Vozora cada usuario pega su propia key en el
// navegador y esta ruta solo la reenvía a Groq para poder generar el audio
// sin toparse con las restricciones de CORS del navegador.

export const runtime = "nodejs";

const GROQ_SPEECH_URL = "https://api.groq.com/openai/v1/audio/speech";
const MAX_INPUT_CHARS = 200; // límite real de los modelos Orpheus en Groq

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Cuerpo de la petición inválido.", 400);
  }

  const { apiKey, model, voice, input, responseFormat } = body || {};

  if (!apiKey || typeof apiKey !== "string") {
    return jsonError("Falta la API key de Groq.", 401);
  }
  if (!model || !voice || !input) {
    return jsonError("Faltan parámetros: model, voice e input son obligatorios.", 400);
  }
  if (input.length > MAX_INPUT_CHARS) {
    return jsonError(
      `El fragmento supera el límite de ${MAX_INPUT_CHARS} caracteres que admite Groq.`,
      400
    );
  }

  let groqResponse;
  try {
    groqResponse = await fetch(GROQ_SPEECH_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
        input,
        response_format: responseFormat || "wav",
      }),
    });
  } catch (e) {
    return jsonError("No se ha podido contactar con la API de Groq.", 502);
  }

  if (!groqResponse.ok) {
    let message = `Groq devolvió un error (${groqResponse.status}).`;
    try {
      const errBody = await groqResponse.json();
      message = errBody?.error?.message || message;
    } catch {
      // el cuerpo no era JSON, mantenemos el mensaje genérico
    }
    return jsonError(message, groqResponse.status);
  }

  const audioBuffer = await groqResponse.arrayBuffer();
  return new Response(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
    },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
