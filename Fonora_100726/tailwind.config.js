/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--color-page)",
        ink: "var(--color-ink)",
        surface: "var(--color-surface)",
        surface2: "var(--color-surface-2)",
        line: "var(--color-line)",
        mark: "var(--color-mark)",
        "mark-ink": "var(--color-mark-ink)",
        ai: "var(--color-ai)",
        stop: "var(--color-stop)",
        muted: "var(--color-muted)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        dial: "0 1px 0 0 var(--color-line) inset, 0 8px 24px -12px rgba(20,22,31,0.35)",
      },
      keyframes: {
        pulseBar: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        pulseBar: "pulseBar 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
