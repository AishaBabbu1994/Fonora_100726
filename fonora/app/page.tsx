'use client'

import { useState, useEffect } from 'react'
import TextReader from './components/TextReader'
import ThemeToggle from './components/ThemeToggle'
import LanguageSelector from './components/LanguageSelector'
import { Sparkles, Waves, Zap } from 'lucide-react'

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('es')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') === 'dark'
    const savedLang = localStorage.getItem('language') || 'es'
    
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
    <main className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-sky-50 via-white to-purple-50'
    }`}>
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
          darkMode ? 'bg-primary-900/20' : 'bg-primary-200/30'
        } blur-3xl animate-float`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full ${
          darkMode ? 'bg-accent-900/20' : 'bg-accent-200/30'
        } blur-3xl animate-float`} style={{ animationDelay: '-3s' }} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full ${
          darkMode ? 'bg-purple-900/10' : 'bg-purple-100/20'
        } blur-3xl`} />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative">
        {/* Header con diseño mejorado */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className={`text-5xl animate-float ${darkMode ? '' : 'text-primary-500'}`}>
                🎙️
              </div>
              <div className={`absolute -inset-1 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 ${
                darkMode ? 'bg-primary-500/30' : 'bg-primary-400/30'
              }`} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="gradient-text">VoxLector</span>
              </h1>
              <p className={`text-sm flex items-center gap-2 flex-wrap ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Waves className="w-4 h-4 text-primary-500" />
                {language === 'es' && 'Texto a voz con pausas personalizadas y voz árabe'}
                {language === 'en' && 'Text to speech with custom pauses and Arabic voice'}
                {language === 'fr' && 'Synthèse vocale avec pauses personnalisées et voix arabe'}
                {language === 'zh' && '带自定义暂停和阿拉伯语的文本转语音'}
                {language === 'pt' && 'Texto para voz com pausas personalizadas e voz árabe'}
                <Zap className="w-4 h-4 text-accent-500" />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Gratuito
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-white/70 text-gray-600'
            } backdrop-blur-sm`}>
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              Web Speech API
            </div>
            <LanguageSelector 
              currentLang={language} 
              onLanguageChange={handleLanguageChange} 
            />
            <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
          </div>
        </header>

        <TextReader language={language} darkMode={darkMode} />
      </div>
    </main>
  )
}
