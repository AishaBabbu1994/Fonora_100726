"use client";

import { t } from "@/lib/i18n";

const SAMPLES = {
  es: "Bienvenido a Vozora. Pasa el ratón por encima de cualquier palabra y la verás resaltarse. Haz clic sobre ella y la lectura empezará exactamente desde ese punto. Puedes elegir voces de tu navegador para cualquier idioma, o activar las voces con inteligencia artificial de Groq para inglés y árabe.",
  en: "Welcome to Vozora. Hover over any word and you will see it highlight. Click on it and the reading will start exactly from that point. You can choose your browser's voices for any language, or turn on Groq's AI voices for English and Arabic.",
  fr: "Bienvenue sur Vozora. Survolez n'importe quel mot et vous le verrez se surligner. Cliquez dessus et la lecture démarrera exactement à cet endroit. Vous pouvez choisir les voix de votre navigateur pour n'importe quelle langue, ou activer les voix IA de Groq pour l'anglais et l'arabe.",
  pt: "Bem-vindo ao Vozora. Passe o mouse sobre qualquer palavra e você a verá destacada. Clique nela e a leitura começará exatamente a partir daquele ponto. Você pode escolher as vozes do seu navegador para qualquer idioma, ou ativar as vozes de IA da Groq para inglês e árabe.",
  zh: "欢迎使用 Vozora。将鼠标悬停在任意单词上即可看到高亮效果。点击它,朗读将从该处精确开始。你可以为任何语言选择浏览器语音,也可以为英语和阿拉伯语开启 Groq 的 AI 语音。",
};

export default function TextInput({ locale, text, setText, wordCount }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wide text-muted">
          {t(locale, "paste_label")}
        </label>
        <button
          type="button"
          onClick={() => setText(SAMPLES[locale] || SAMPLES.es)}
          className="text-xs text-ai hover:underline"
        >
          {t(locale, "load_sample")}
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t(locale, "paste_placeholder")}
        rows={6}
        className="w-full resize-y bg-surface border border-line rounded-lg px-3 py-2.5 text-base leading-relaxed text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-mark"
      />
      <div className="text-xs font-mono text-muted">
        {t(locale, "words_count", wordCount)}
      </div>
    </div>
  );
}
