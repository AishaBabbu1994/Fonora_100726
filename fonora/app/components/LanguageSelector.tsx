'use client'

interface Props {
  currentLang: string
  onLanguageChange: (lang: string) => void
}

export default function LanguageSelector({ currentLang, onLanguageChange }: Props) {
  const languages = [
    { code: 'es', name: '🇪🇸 Español' },
    { code: 'en', name: '🇬🇧 English' },
    { code: 'fr', name: '🇫🇷 Français' },
    { code: 'zh', name: '🇨🇳 中文' },
    { code: 'pt', name: '🇵🇹 Português' }
  ]

  return (
    <select
      value={currentLang}
      onChange={(e) => onLanguageChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
               focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  )
}
