# Vozora — Lector de voz interactivo

Vozora convierte cualquier texto en una lectura en voz alta interactiva: pasa el
ratón por encima de una palabra para verla resaltarse y haz clic para empezar a
escuchar exactamente desde ahí. Incluye dos motores de voz:

- **Voces del navegador** (Web Speech API): gratis, sin API key, funcionan con
  prácticamente cualquier idioma instalado en el navegador del usuario
  (español, francés, portugués, chino, etc.).
- **Voces IA de Groq (Orpheus)**: voces de altísima calidad generadas por IA,
  reenviadas a través de la API de Groq. **Importante:** hoy en día Groq solo
  ofrece voces IA en **inglés** y **árabe (dialecto saudí)** — es una
  limitación real de su API, no de esta app. Por eso Vozora combina ambos
  motores: usa Groq cuando quieras la máxima calidad en inglés/árabe, y las
  voces del navegador para el resto de idiomas.

## Funcionalidad

1. El usuario pega o escribe un texto en el cuadro principal.
2. El texto se muestra como palabras clicables: al pasar el ratón por encima
   se resaltan, y al hacer clic la lectura empieza desde esa palabra.
3. El usuario elige el motor de voz (navegador o Groq), el idioma y la voz.
4. Puede ajustar velocidad, tono (solo con voces del navegador), pausa entre
   palabras/fragmentos y repetición (por minutos, o infinita).
5. Mientras se lee, la palabra (motor navegador) o el fragmento en curso
   (motor Groq) se resalta en el texto, como una especie de "karaoke" de
   lectura.
6. El texto leído se guarda automáticamente en un historial local (en el
   navegador), desde donde se puede volver a cargar o eliminar.
7. El texto se puede exportar a PDF en cualquier momento.
8. La interfaz está disponible en español, inglés, francés, portugués y
   chino, y tiene modo claro/oscuro.

### Por qué el motor Groq funciona "por fragmentos" y no palabra a palabra

La API de texto a voz de Groq (Orpheus) tiene un límite de 200 caracteres por
petición y no devuelve marcas de tiempo por palabra. Pedir una petición por
cada palabra sería lentísimo y muy costoso. Por eso Vozora divide el texto en
fragmentos de manuscrito de hasta ~190 caracteres (cortando siempre en un
espacio, nunca a mitad de palabra), pide el audio de cada fragmento a Groq y
resalta el fragmento completo mientras suena. Con las voces del navegador, en
cambio, sí se resalta palabra por palabra, igual que con la síntesis nativa
del sistema operativo.

## Cómo conseguir tu API key de Groq

1. Entra en [console.groq.com](https://console.groq.com) y crea una cuenta
   gratuita (o inicia sesión).
2. Ve a la sección **API Keys** (o entra directamente en
   [console.groq.com/keys](https://console.groq.com/keys)).
3. Pulsa **Create API Key**, ponle un nombre y cópiala. Empieza por `gsk_...`.
4. Pega esa key en la barra superior de Vozora ("Tu API key de Groq"). Se
   guarda **solo en tu navegador** (en `localStorage`), nunca en ningún
   servidor de Vozora. La única vez que "sale" de tu navegador es cuando la
   app la reenvía a Groq, a través de nuestra propia ruta `/api/tts`, para
   generar el audio que has pedido.
5. Ten en cuenta que el uso de las voces Orpheus tiene coste en Groq (consulta
   sus [precios actuales](https://console.groq.com/docs/text-to-speech/orpheus)).
   Las voces del navegador son siempre gratuitas.

## Requisitos

- Node.js 18.18 o superior
- npm (o pnpm/yarn si lo prefieres)

## Desarrollo en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). No necesitas ninguna
variable de entorno: cada persona que use la app pega su propia API key de
Groq en la interfaz.

## Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub/GitLab/Bitbucket (o usa
   `vercel` desde la CLI directamente sobre esta carpeta).
2. Entra en [vercel.com](https://vercel.com), pulsa **Add New… → Project** e
   importa el repositorio.
3. Vercel detectará automáticamente que es un proyecto Next.js: no hace falta
   tocar ningún ajuste de build.
4. Como cada usuario aporta su propia API key desde el navegador, **no
   necesitas configurar ninguna variable de entorno** en Vercel para que la
   app funcione en producción.
5. Pulsa **Deploy**. En un par de minutos tendrás tu propia URL pública de
   Vozora.

### Despliegue con CLI (alternativa)

```bash
npm install -g vercel
vercel
```

Sigue las instrucciones en pantalla; con el plan gratuito de Vercel es
suficiente para este proyecto.

## Estructura del proyecto

```
app/
  layout.js          Layout raíz, fuentes y tema
  page.js             Página principal (une todos los componentes)
  globals.css         Tokens de diseño (colores, tipografía, "dial")
  api/tts/route.js    Proxy hacia la API de Groq (audio/speech)
components/           Componentes de interfaz (cabecera, controles, lector…)
lib/                  Lógica: i18n, motor de lectura, voces, chunking de texto
```

## Nota sobre el origen de este proyecto

Vozora es una app equivalente en funcionalidad a un lector de texto a voz
interactivo, con marca, diseño, contenido y arquitectura propios (incluida la
incorporación de un motor de voz IA vía Groq), no una copia literal de
ninguna página existente.
