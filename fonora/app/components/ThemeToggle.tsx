'use client'

import { Moon, Sun } from 'lucide-react'

interface Props {
  darkMode: boolean
  toggleTheme: () => void
}

export default function ThemeToggle({ darkMode, toggleTheme }: Props) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 
               bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-700
               transition-all duration-300 hover:scale-105 hover:border-primary-400"
      aria-label="Toggle theme"
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  )
}
