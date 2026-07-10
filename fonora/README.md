# 🎙️ VoxLector - Lector de Texto a Voz Interactivo

Aplicación web que convierte texto en voz usando la API de Groq, con palabras interactivas y soporte multilenguaje.

## ✨ Características

- **Texto a voz** con IA de Groq
- **Palabras clickeables** - haz clic en cualquier palabra para leer desde ahí
- **Sombreado del segmento** - visualiza el texto que se va a leer
- **Multilenguaje** - interfaz en español, inglés, francés, chino y portugués
- **Modo oscuro/claro** - con persistencia en localStorage
- **Historial** - guarda tus textos anteriores
- **Exportar a PDF** - guarda tus lecturas
- **Controles completos** - velocidad, tono, pausa entre palabras, repetición

## 🚀 Cómo obtener tu API Key de Groq

1. Ve a [https://console.groq.com](https://console.groq.com)
2. Regístrate o inicia sesión
3. Navega a la sección "API Keys"
4. Clic en "Create API Key"
5. Copia tu clave y pégala en la aplicación

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <tu-repo>
cd voxlector

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build