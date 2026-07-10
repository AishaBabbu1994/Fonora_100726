'use client'

import { useState, useEffect } from 'react'
import TextReader from './components/TextReader'
import ApiKeyInput from './components/ApiKeyInput'
import ThemeToggle from './components/ThemeToggle'
import LanguageSelector from './components/LanguageSelector'

export default function Home() {
  const [apiKey, setApiKey] = useState<string>('')
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('es')

  useEffect(() => {
    const savedKey = localStorage.getItem('groq-api-key') || ''
    const savedTheme = localStorage.getItem('theme') === 'dark'
    const savedLang = localStorage.getItem('language') || 'es'
    
    setApiKey(savedKey)
    setDarkMode(savedTheme)
    setLanguage(savedLang)
    
    if (savedTheme) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !darkMode
    setDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark')
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              🎙️ VoxLector
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {language === 'es' && 'Texto a voz con palabras interactivas'}
              {language === 'en' && 'Text to speech with interactive words'}
              {language === 'fr' && 'Synthèse vocale avec mots interactifs'}
              {language === 'zh' && '带有交互式单词的文本转语音'}
              {language === 'pt' && 'Texto para voz com palavras interativas'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector 
              currentLang={language} 
              onLanguageChange={handleLanguageChange} 
            />
            <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
          </div>
        </header>

        <ApiKeyInput 
          apiKey={apiKey} 
          onApiKeyChange={setApiKey} 
          language={language}
        />

        {apiKey && (
          <TextReader apiKey={apiKey} language={language} />
        )}
      </div>
    </main>
  )
}
