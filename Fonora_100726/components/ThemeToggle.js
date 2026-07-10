"use client";

import { useEffect } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { t } from "@/lib/i18n";

export default function ThemeToggle({ locale }) {
  const [theme, setTheme, hydrated] = useLocalStorage("vozora:theme", null);

  useEffect(() => {
    if (!hydrated || theme === null) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, hydrated]);

  function toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
    document.documentElement.classList.toggle("dark", !isDark);
  }

  return (
    <button
      onClick={toggle}
      aria-label={t(locale, "theme_toggle")}
      title={t(locale, "theme_toggle")}
      className="w-9 h-9 grid place-items-center rounded-md border border-line bg-surface hover:bg-surface2 transition-colors"
    >
      <span className="dark:hidden">🌙</span>
      <span className="hidden dark:inline">☀️</span>
    </button>
  );
}
