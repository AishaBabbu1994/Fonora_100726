'use client'

interface Props {
  darkMode: boolean
  toggleTheme: () => void
}

export default function ThemeToggle({ darkMode, toggleTheme }: Props) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  )
}
