'use client'

import { useState } from 'react'

interface Props {
  apiKey: string
  onApiKeyChange: (key: string) => void
  language: string
}

export default function ApiKeyInput({ apiKey, onApiKeyChange, language }: Props) {
  const [showKey, setShowKey] = useState(false)

  const texts = {
    es: {
      title: '🔑 Configuración de API',
      label: 'Tu API Key de Groq',
      placeholder: 'Pega tu API key aquí...',
      save: 'Guardar',
      saved: '✓ Guardada',
      show: 'Mostrar',
      hide: 'Ocultar'
    },
    en: {
      title: '🔑 API Configuration',
      label: 'Your Groq API Key',
      placeholder: 'Paste your API key here...',
      save: 'Save',
      saved: '✓ Saved',
      show: 'Show',
      hide: 'Hide'
    },
    fr: {
      title: '🔑 Configuration API',
      label: 'Votre clé API Groq',
      placeholder: 'Collez votre clé API ici...',
      save: 'Enregistrer',
      saved: '✓ Enregistrée',
      show: 'Afficher',
      hide: 'Cacher'
    },
    zh: {
      title: '🔑 API配置',
      label: '您的Groq API密钥',
      placeholder: '在此粘贴您的API密钥...',
      save: '保存',
      saved: '✓ 已保存',
      show: '显示',
      hide: '隐藏'
    },
    pt: {
      title: '🔑 Configuração da API',
      label: 'Sua chave da API Groq',
      placeholder: 'Cole sua chave da API aqui...',
      save: 'Salvar',
      saved: '✓ Salva',
      show: 'Mostrar',
      hide: 'Ocultar'
    }
  }

  const t = texts[language as keyof typeof texts] || texts.es

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('groq-api-key', apiKey)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {t.title}
      </h2>
      <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={t.placeholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-2 text-sm text-primary-600 dark:text-primary-400"
          >
            {showKey ? t.hide : t.show}
          </button>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg 
                   font-medium transition-colors whitespace-nowrap"
        >
          {localStorage.getItem('groq-api-key') === apiKey && apiKey ? t.saved : t.save}
        </button>
      </form>
    </div>
  )
}