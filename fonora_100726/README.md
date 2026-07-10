# LexiVoz · Lector Interactivo con IA

Lector de texto con voz (TTS) interactivo, clic por palabra, pausas configurables, repetición ajustable y un panel de IA asistida por Groq.

## Características

- 🔊 Lectura palabra a palabra haciendo clic en cualquier punto del texto
- 🎨 Diseño oscuro con vidrio y gradientes (glassmorphism)
- ⚡ Velocidad, tono y pausa entre palabras configurables
- 🔁 Repetición activada (infinito o por segundos)
- 🤖 Asistente de IA para explicar, resumir, traducir y generar quizzes del texto seleccionado
- 🌐 Funciona en cualquier idioma que soporte el navegador (Web Speech API)

## Obtener API Key de Groq

1. Ve a [console.groq.com](https://console.groq.com)
2. Crea una cuenta (gratis)
3. En la sección "API Keys" crea una nueva key
4. Copiala y pégala en el botón **Ajustes (⚙️)** dentro de la app, o usa `GROQ_API_KEY` en Vercel

## Despliegue en Vercel

### Opción A: Vercel (recomendada)

```bash
# 1. Instala Vercel CLI si no la tienes
npm i -g vercel

# 2. Desde la carpeta del proyecto
vercel
```

Luego en el dashboard de Vercel ve a **Settings → Environment Variables** y agrega:

| Variable | Valor |
|----------|-------|
| `GROQ_API_KEY` | Tu key de Groq |

### Opción B: Docker / VPS

```bash
npm install
npm run build
npm run start
```

Asegúrate de tener configurada la variable `GROQ_API_KEY` en tu entorno.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Tecnologías

- Next.js 14
- Tailwind CSS
- React
- Web Speech API (voz nativa del sistema)
- Groq SDK / OpenAI-compatible API

## Notas

- La API key de Groq se guarda en `localStorage` del navegador cuando se ingresa manualmente. No se envía a ningún servidor propio.
- Si no configuras la key en Vercel ni en la UI, el panel de IA no funcionará.
- El TTS usa las voces instaladas en tu sistema operativo y navegador.
