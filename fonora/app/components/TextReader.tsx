'use client'

import { useState, useRef, useEffect } from 'react'
import { Groq } from 'groq-sdk'

interface Props {
  apiKey: string
  language: string
}

export default function TextReader({ apiKey, language }: Props) {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [highlightedWord, setHighlightedWord] = useState<number | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<{ start: number; end: number } | null>(null)
  
  // Controles
  const [voice, setVoice] = useState('alloy')
  const [speed, setSpeed] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [pauseBetweenWords, setPauseBetweenWords] = useState(0.0)
  const [repeatCount, setRepeatCount] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wordsRef = useRef<HTMLDivElement>(null)

  const texts = {
    es: {
      title: '📖 Lector de Texto',
      placeholder: 'Escribe o pega tu texto aquí...',
      read: '🔊 Leer',
      pause: '⏸️ Pausa',
      resume: '▶️ Reanudar',
      stop: '⏹️ Detener',
      voice: '🗣️ Voz',
      speed: '⚡ Velocidad',
      pitch: '🎵 Tono',
      pauseBetween: '⏸️ Pausa entre palabras',
      repeat: '🔄 Repetir (0=infinito)',
      wordCount: 'palabras',
      repetition: 'Repetición',
      active: 'activa',
      inactive: 'inactiva',
      time: 'Tiempo',
      exporting: 'Exportando...',
      exportPDF: '📄 Exportar PDF',
      history: '📜 Historial'
    },
    en: {
      title: '📖 Text Reader',
      placeholder: 'Write or paste your text here...',
      read: '🔊 Read',
      pause: '⏸️ Pause',
      resume: '▶️ Resume',
      stop: '⏹️ Stop',
      voice: '🗣️ Voice',
      speed: '⚡ Speed',
      pitch: '🎵 Pitch',
      pauseBetween: '⏸️ Pause between words',
      repeat: '🔄 Repeat (0=infinite)',
      wordCount: 'words',
      repetition: 'Repetition',
      active: 'active',
      inactive: 'inactive',
      time: 'Time',
      exporting: 'Exporting...',
      exportPDF: '📄 Export PDF',
      history: '📜 History'
    },
    fr: {
      title: '📖 Lecteur de Texte',
      placeholder: 'Écrivez ou collez votre texte ici...',
      read: '🔊 Lire',
      pause: '⏸️ Pause',
      resume: '▶️ Reprendre',
      stop: '⏹️ Arrêter',
      voice: '🗣️ Voix',
      speed: '⚡ Vitesse',
      pitch: '🎵 Hauteur',
      pauseBetween: '⏸️ Pause entre les mots',
      repeat: '🔄 Répéter (0=infini)',
      wordCount: 'mots',
      repetition: 'Répétition',
      active: 'active',
      inactive: 'inactive',
      time: 'Temps',
      exporting: 'Exportation...',
      exportPDF: '📄 Exporter PDF',
      history: '📜 Historique'
    },
    zh: {
      title: '📖 文本阅读器',
      placeholder: '在此写入或粘贴您的文本...',
      read: '🔊 阅读',
      pause: '⏸️ 暂停',
      resume: '▶️ 继续',
      stop: '⏹️ 停止',
      voice: '🗣️ 语音',
      speed: '⚡ 速度',
      pitch: '🎵 音调',
      pauseBetween: '⏸️ 词间暂停',
      repeat: '🔄 重复（0=无限）',
      wordCount: '字数',
      repetition: '重复',
      active: '活跃',
      inactive: '非活跃',
      time: '时间',
      exporting: '导出中...',
      exportPDF: '📄 导出PDF',
      history: '📜 历史记录'
    },
    pt: {
      title: '📖 Leitor de Texto',
      placeholder: 'Escreva ou cole seu texto aqui...',
      read: '🔊 Ler',
      pause: '⏸️ Pausar',
      resume: '▶️ Retomar',
      stop: '⏹️ Parar',
      voice: '🗣️ Voz',
      speed: '⚡ Velocidade',
      pitch: '🎵 Tom',
      pauseBetween: '⏸️ Pausa entre palavras',
      repeat: '🔄 Repetir (0=infinito)',
      wordCount: 'palavras',
      repetition: 'Repetição',
      active: 'ativa',
      inactive: 'inativa',
      time: 'Tempo',
      exporting: 'Exportando...',
      exportPDF: '📄 Exportar PDF',
      history: '📜 Histórico'
    }
  }

  const t = texts[language as keyof typeof texts] || texts.es

  const voices = {
    es: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    en: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    fr: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    zh: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    pt: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
  }

  const words = text.split(/\s+/).filter(w => w.length > 0)

  const handleRead = async () => {
    if (!text.trim() || !apiKey) return
    
    setIsLoading(true)
    try {
      const groq = new Groq({ 
        apiKey: apiKey,
        dangerouslyAllowBrowser: true 
      })

      // Obtener el segmento seleccionado o todo el texto
      const textToRead = selectedSegment 
        ? words.slice(selectedSegment.start, selectedSegment.end + 1).join(' ')
        : text

      const response = await groq.audio.speech.create({
        model: 'tts-1',
        voice: voice as any,
        input: textToRead,
        speed: speed,
        response_format: 'mp3',
      })

      const blob = new Blob([await response.arrayBuffer()], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      
      setAudioUrl(url)
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
        setIsPaused(false)
      }
      
      // Simular resaltado de palabras
      simulateWordHighlight(textToRead)
      
    } catch (error) {
      console.error('Error al generar audio:', error)
      alert('Error al generar el audio. Verifica tu API key.')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateWordHighlight = (textToRead: string) => {
    const wordArray = textToRead.split(/\s+/)
    let index = 0
    
    const interval = setInterval(() => {
      if (index < wordArray.length) {
        setHighlightedWord(index)
        index++
      } else {
        clearInterval(interval)
        setHighlightedWord(null)
      }
    }, 1000 / speed * 0.5)
  }

  const handleWordClick = (index: number) => {
    setSelectedSegment({ start: index, end: words.length - 1 })
    setHighlightedWord(index)
  }

  const handlePauseResume = () => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play()
        setIsPaused(false)
      } else {
        audioRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setIsPaused(false)
      setHighlightedWord(null)
      setSelectedSegment(null)
    }
  }

  const handleExportPDF = () => {
    // Simple PDF export usando print
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.voice}
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {voices[language as keyof typeof voices]?.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.speed} {speed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.pitch} {pitch}x
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.pauseBetween} {pauseBetweenWords}s
            </label>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={pauseBetweenWords}
              onChange={(e) => setPauseBetweenWords(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.repeat}
          </label>
          <input
            type="number"
            min="0"
            value={repeatCount}
            onChange={(e) => setRepeatCount(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Área de texto */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setSelectedSegment(null)
          }}
          placeholder={t.placeholder}
          className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        
        {/* Palabras interactivas */}
        {words.length > 0 && (
          <div 
            ref={wordsRef}
            className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg
                     bg-gray-50 dark:bg-gray-700/50 max-h-40 overflow-y-auto"
          >
            {words.map((word, index) => (
              <span
                key={index}
                onClick={() => handleWordClick(index)}
                className={`cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 
                           transition-colors rounded px-0.5 ${
                  highlightedWord === index ? 'highlight-word' : ''
                } ${
                  selectedSegment && index >= selectedSegment.start && index <= selectedSegment.end
                    ? 'highlight-segment'
                    : ''
                }`}
              >
                {word}{' '}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>📖 {words.length} {t.wordCount}</span>
          <span>•</span>
          <span>🔁 {t.repetition}: {repeatCount === 0 ? t.infinite : repeatCount}</span>
          <span>•</span>
          <span>⏱️ 0.0s</span>
        </div>
      </div>

      {/* Botones de control */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleRead}
          disabled={isLoading || !text.trim()}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400
                   text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? '⏳ Generando...' : t.read}
        </button>
        
        {isPlaying && (
          <>
            <button
              onClick={handlePauseResume}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
            >
              {isPaused ? t.resume : t.pause}
            </button>
            
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              {t.stop}
            </button>
          </>
        )}
        
        <button
          onClick={handleExportPDF}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          {t.exportPDF}
        </button>
      </div>

      {/* Reproductor de audio oculto */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}