# VoxArchiva - Lector de Texto Inteligente (TTS)

VoxArchiva es una aplicación web rápida, minimalista y accesible diseñada para procesar textos y reproducirlos mediante voz artificial en múltiples idiomas (**Español, Inglés, Francés, Chino y Portugués**). Utiliza la API de Groq para optimizar la fluidez lectora del texto antes de la síntesis de voz nativa.

## 🚀 Características Incorporadas

- **Soporte Multilenguaje:** Configurado de forma nativa para 5 idiomas clave.
- **Sombreado Dinámico:** Selecciona con el cursor cualquier extracto y la app priorizará la lectura de ese fragmento de inmediato.
- **Client-Side API Key:** Tu API Key de Groq se guarda de manera segura de forma local en tu propio navegador (`localStorage`), sin servidores intermediarios.
- **Historial Local:** Almacenamiento rápido de tus últimos textos procesados.
- **Exportación Limpia:** Botón para imprimir o guardar directamente en formato PDF.
- **Modo Oscuro Integrado:** Interfaz de descanso visual activa por defecto.

## 🛠️ Requisitos e Instalación

Asegúrate de tener instalado **Node.js** (versión 18 o superior).

1. Clona o crea el proyecto estructurado con Next.js y Tailwind CSS:
   ```bash
   npx create-next-app@latest vox-archiva --typescript --tailwind --app