'use client'

import { Globe } from 'lucide-react'

interface Props {
  currentLang: string
  onLanguageChange: (lang: string) => void
}

export default function LanguageSelector({ currentLang, onLanguageChange }: Props) {
  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' }
  ]

  return (
    <div className="relative group">
      <select
        value={currentLang}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="px-4 py-2.5 pr-10 rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 
                 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-900 dark:text-gray-100
                 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300
                 appearance-none cursor-pointer hover:border-primary-400"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code} className="dark:bg-gray-800">
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
}
