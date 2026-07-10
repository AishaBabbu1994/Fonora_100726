'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Play, Pause, Square, Volume2, Gauge, Repeat, 
  FileText, Download, Mic, Sparkles, Wand2,
  AlertCircle, CheckCircle2, RotateCcw, Clock
} from 'lucide-react'

interface Props {
  language: string
  darkMode: boolean
}

export default function TextReader({ language, darkMode }: Props) {
  const [text, setText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [highlightedWord, setHighlightedWord] = useState<number | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<{ start: number; end: number } | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [speed, setSpeed] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [pauseDuration, setPauseDuration] = useState(0)
  const [repeatCount, setRepeatCount] = useState(0)
  const [repeatCounter, setRepeatCounter] = useState(0)
  
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [wordCount, setWordCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const wordsRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const texts = {
    es: {
      placeholder: '✏️ Escribe o pega tu texto aquí...',
      read: 'Leer Texto',
      pause: 'Pausa',
      resume: 'Reanudar',
      stop: 'Detener',
      voice: 'Voz',
      speed: 'Velocidad',
      pitch: 'Tono',
      pauseBetween: 'Pausa entre palabras',
      repeat: 'Repeticiones',
      wordCount: 'palabras',
      repetition: 'Repetición',
      infinite: 'Infinito',
      exportPDF: 'Exportar PDF',
      generating: 'Generando...',
      noVoices: 'Cargando voces...',
      selectVoice: 'Selecciona una voz',
      word: 'palabra',
      words: 'palabras',
      reset: 'Reiniciar',
      clear: 'Limpiar texto',
      ready: 'Listo para leer',
      speaking: 'Leyendo...',
      paused: 'Pausado',
      seconds: 'segundos',
      pauseLabel: 'Pausa',
    },
    en: {
      placeholder: '✏️ Write or paste your text here...',
      read: 'Read Text',
      pause: 'Pause',
      resume: 'Resume',
      stop: 'Stop',
      voice: 'Voice',
      speed: 'Speed',
      pitch: 'Pitch',
      pauseBetween: 'Pause between words',
      repeat: 'Repeats',
      wordCount: 'words',
      repetition: 'Repetition',
      infinite: 'Infinite',
      exportPDF: 'Export PDF',
      generating: 'Generating...',
      noVoices: 'Loading voices...',
      selectVoice: 'Select a voice',
      word: 'word',
      words: 'words',
      reset: 'Reset',
      clear: 'Clear text',
      ready: 'Ready to read',
      speaking: 'Reading...',
      paused: 'Paused',
      seconds: 'seconds',
      pauseLabel: 'Pause',
    },
    fr: {
      placeholder: '✏️ Écrivez ou collez votre texte ici...',
      read: 'Lire',
      pause: 'Pause',
      resume: 'Reprendre',
      stop: 'Arrêter',
      voice: 'Voix',
      speed: 'Vitesse',
      pitch: 'Hauteur',
      pauseBetween: 'Pause entre les mots',
      repeat: 'Répétitions',
      wordCount: 'mots',
      repetition: 'Répétition',
      infinite: 'Infini',
      exportPDF: 'Exporter PDF',
      generating: 'Génération...',
      noVoices: 'Chargement des voix...',
      selectVoice: 'Sélectionnez une voix',
      word: 'mot',
      words: 'mots',
      reset: 'Réinitialiser',
      clear: 'Effacer',
      ready: 'Prêt à lire',
      speaking: 'Lecture...',
      paused: 'Pausé',
      seconds: 'secondes',
      pauseLabel: 'Pause',
    },
    zh: {
      placeholder: '✏️ 在此写入或粘贴您的文本...',
      read: '阅读',
      pause: '暂停',
      resume: '继续',
      stop: '停止',
      voice: '语音',
      speed: '速度',
      pitch: '音调',
      pauseBetween: '词间暂停',
      repeat: '重复次数',
      wordCount: '字数',
      repetition: '重复',
      infinite: '无限',
      exportPDF: '导出PDF',
      generating: '生成中...',
      noVoices: '加载语音中...',
      selectVoice: '选择语音',
      word: '字',
      words: '字',
      reset: '重置',
      clear: '清空',
      ready: '准备阅读',
      speaking: '阅读中...',
      paused: '已暂停',
      seconds: '秒',
      pauseLabel: '暂停',
    },
    pt: {
      placeholder: '✏️ Escreva ou cole seu texto aqui...',
      read: 'Ler',
      pause: 'Pausar',
      resume: 'Retomar',
      stop: 'Parar',
      voice: 'Voz',
      speed: 'Velocidade',
      pitch: 'Tom',
      pauseBetween: 'Pausa entre palavras',
      repeat: 'Repetições',
      wordCount: 'palavras',
      repetition: 'Repetição',
      infinite: 'Infinito',
      exportPDF: 'Exportar PDF',
      generating: 'Gerando...',
      noVoices: 'Carregando vozes...',
      selectVoice: 'Selecione uma voz',
      word: 'palavra',
      words: 'palavras',
      reset: 'Reiniciar',
      clear: 'Limpar',
      ready: 'Pronto para ler',
      speaking: 'Lendo...',
      paused: 'Pausado',
      seconds: 'segundos',
      pauseLabel: 'Pausa',
    },
    ar: {
      placeholder: '✏️ اكتب أو الصق النص هنا...',
      read: 'قراءة النص',
      pause: 'إيقاف مؤقت',
      resume: 'استئناف',
      stop: 'إيقاف',
      voice: 'صوت',
      speed: 'السرعة',
      pitch: 'طبقة الصوت',
      pauseBetween: 'وقفة بين الكلمات',
      repeat: 'التكرار',
      wordCount: 'كلمات',
      repetition: 'التكرار',
      infinite: 'غير محدود',
      exportPDF: 'تصدير PDF',
      generating: 'جاري التوليد...',
      noVoices: 'جاري تحميل الأصوات...',
      selectVoice: 'اختر صوتاً',
      word: 'كلمة',
      words: 'كلمات',
      reset: 'إعادة تعيين',
      clear: 'مسح النص',
      ready: 'جاهز للقراءة',
      speaking: 'جاري القراءة...',
      paused: 'متوقف مؤقتاً',
      seconds: 'ثواني',
      pauseLabel: 'وقفة',
    }
  }

  const t = texts[language as keyof typeof texts] || texts.es

  const words = text.split(/\s+/).filter(w => w.length > 0)

  // Cargar voces disponibles
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setAvailableVoices(voices)
        setIsLoadingVoices(false)
        // Seleccionar voz en español o árabe por defecto según el idioma
        let defaultVoice
        if (language === 'ar') {
          defaultVoice = voices.find(v => v.lang.startsWith('ar'))
        } else {
          defaultVoice = voices.find(v => v.lang.startsWith('es'))
        }
        if (defaultVoice) setSelectedVoice(defaultVoice.name)
        else if (voices.length > 0) setSelectedVoice(voices[0].name)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [language])

  // Actualizar contador de palabras
  useEffect(() => {
    setWordCount(words.length)
  }, [text])

  // Timer para el tiempo de lectura
  useEffect(() => {
    if (isSpeaking) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (!isPlaying) {
        setElapsedTime(0)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isSpeaking, isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Función para leer con pausas entre palabras
  const speakWithPauses = (textToRead: string, wordsArray: string[]) => {
    let currentIndex = 0
    
    const speakNextWord = () => {
      if (currentIndex >= wordsArray.length) {
        // Terminar lectura
        if (repeatCount === 0 || repeatCounter < repeatCount - 1) {
          setRepeatCounter(prev => prev + 1)
          currentIndex = 0
          setTimeout(() => speakNextWord(), 300)
        } else {
          setIsPlaying(false)
          setIsSpeaking(false)
          setHighlightedWord(null)
          setSelectedSegment(null)
          setCurrentWordIndex(0)
          setRepeatCounter(0)
        }
        return
      }

      const word = wordsArray[currentIndex]
      const utterance = new SpeechSynthesisUtterance(word)
      const voice = availableVoices.find(v => v.name === selectedVoice)
      if (voice) utterance.voice = voice
      utterance.lang = voice?.lang || (language === 'ar' ? 'ar-SA' : 'es-ES')
      utterance.rate = speed
      utterance.pitch = pitch

      utterance.onstart = () => {
        setIsPlaying(true)
        setIsSpeaking(true)
        setHighlightedWord(currentIndex)
        setCurrentWordIndex(currentIndex)
        
        // Scroll a la palabra
        if (wordsRef.current) {
          const wordElements = wordsRef.current.children
          if (wordElements[currentIndex]) {
            wordElements[currentIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
          }
        }
      }

      utterance.onend = () => {
        currentIndex++
        if (pauseDuration > 0 && currentIndex < wordsArray.length) {
          // Hacer pausa entre palabras
          pauseTimeoutRef.current = setTimeout(() => {
            speakNextWord()
          }, pauseDuration * 1000)
        } else {
          speakNextWord()
        }
      }

      window.speechSynthesis.speak(utterance)
      utteranceRef.current = utterance
    }

    speakNextWord()
  }

  const handleRead = () => {
    if (!text.trim() || !selectedVoice) return

    // Detener cualquier reproducción anterior
    window.speechSynthesis.cancel()
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
      pauseTimeoutRef.current = null
    }
    
    const textToRead = selectedSegment 
      ? words.slice(selectedSegment.start, selectedSegment.end + 1)
      : words

    if (textToRead.length === 0) return

    setRepeatCounter(0)
    speakWithPauses(textToRead.join(' '), textToRead)
  }

  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsSpeaking(true)
    } else {
      window.speechSynthesis.pause()
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current)
        pauseTimeoutRef.current = null
      }
      setIsPaused(true)
      setIsSpeaking(false)
    }
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current)
      pauseTimeoutRef.current = null
    }
    setIsPlaying(false)
    setIsSpeaking(false)
    setIsPaused(false)
    setHighlightedWord(null)
    setSelectedSegment(null)
    setCurrentWordIndex(0)
    setRepeatCounter(0)
  }

  const handleWordClick = (index: number) => {
    if (isPlaying) {
      handleStop()
    }
    setSelectedSegment({ start: index, end: words.length - 1 })
    setHighlightedWord(index)
  }

  const handleClearText = () => {
    if (isPlaying) handleStop()
    setText('')
    setSelectedSegment(null)
    setHighlightedWord(null)
  }

  const handleReset = () => {
    handleStop()
    setSpeed(1.0)
    setPitch(1.0)
    setPauseDuration(0)
    setRepeatCount(0)
    setSelectedSegment(null)
    setHighlightedWord(null)
    setElapsedTime(0)
  }

  const handleExportPDF = () => {
    window.print()
  }

  const isRTL = language === 'ar'

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Controles de voz */}
      <div className="glass-effect rounded-2xl shadow-2xl p-6 md:p-8 card-hover">
        <div className="flex items-center gap-2 mb-5">
          <Volume2 className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            🎛️ {language === 'ar' ? 'التحكم بالصوت' : 'Controles de Voz'}
          </h2>
          <div className="flex-1" />
          <span className={`text-xs px-2.5 py-1 rounded-full ${
            isSpeaking 
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-gray-200/50 text-gray-600 dark:text-gray-400'
          }`}>
            {isSpeaking ? '🔴 ' + t.speaking : isPaused ? '⏸️ ' + t.paused : '● ' + t.ready}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🗣️ {t.voice}
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="select-field"
              disabled={isLoadingVoices}
            >
              <option value="">{isLoadingVoices ? t.noVoices : t.selectVoice}</option>
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name} className="dark:bg-gray-800">
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Gauge className="inline w-4 h-4 mr-1" /> {t.speed} {speed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="range-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wand2 className="inline w-4 h-4 mr-1" /> {t.pitch} {pitch}x
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="range-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="inline w-4 h-4 mr-1" /> {t.pauseBetween} {pauseDuration}s
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pauseDuration}
              onChange={(e) => setPauseDuration(parseFloat(e.target.value))}
              className="range-input"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0s</span>
              <span>2s</span>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Repeat className="inline w-4 h-4 mr-1" /> {t.repeat} {repeatCount === 0 ? '∞' : repeatCount}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={repeatCount}
              onChange={(e) => setRepeatCount(parseInt(e.target.value))}
              className="range-input"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t.infinite}</span>
              <span>10x</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleRead}
            disabled={!text.trim() || isLoadingVoices || !selectedVoice}
            className="btn-primary flex items-center gap-2 pulse-ring"
          >
            {isSpeaking ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                {t.generating}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {t.read}
              </>
            )}
          </button>
          
          {isPlaying && (
            <>
              <button
                onClick={handlePauseResume}
                className="btn-secondary flex items-center gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    {t.resume}
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    {t.pause}
                  </>
                )}
              </button>
              
              <button
                onClick={handleStop}
                className="btn-danger flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                {t.stop}
              </button>
            </>
          )}
          
          <button
            onClick={handleClearText}
            className="px-4 py-2.5 rounded-xl border-2 border-gray-300/50 dark:border-gray-600/50
                     hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300
                     flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <AlertCircle className="w-4 h-4" />
            {t.clear}
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border-2 border-gray-300/50 dark:border-gray-600/50
                     hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300
                     flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
            {t.reset}
          </button>
          
          <button
            onClick={handleExportPDF}
            className="btn-success flex items-center gap-2 ml-auto"
          >
            <Download className="w-5 h-5" />
            {t.exportPDF}
          </button>
        </div>
      </div>

      {/* Área de texto */}
      <div className="glass-effect rounded-2xl shadow-2xl p-6 md:p-8 card-hover">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            ✏️ {language === 'ar' ? 'النص' : 'Texto'}
          </h2>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {wordCount} {wordCount === 1 ? t.word : t.words}
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setSelectedSegment(null)
            if (isPlaying) handleStop()
          }}
          placeholder={t.placeholder}
          className={`input-field min-h-[150px] resize-y ${isRTL ? 'text-right' : ''}`}
          style={{ lineHeight: '1.8' }}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        
        {/* Palabras interactivas */}
        {words.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'ar' ? '🔹 انقر على أي كلمة للقراءة منها' : '🔹 Haz clic en cualquier palabra para leer desde ahí'}
              </span>
            </div>
            <div 
              ref={wordsRef}
              className={`word-cloud ${isRTL ? 'arabic-text' : ''}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {words.map((word, index) => (
                <span
                  key={index}
                  onClick={() => handleWordClick(index)}
                  className={`inline-block cursor-pointer transition-all duration-300 rounded px-1.5 py-0.5 mx-0.5 my-0.5 text-sm ${
                    highlightedWord === index ? 'highlight-word scale-110' : ''
                  } ${
                    selectedSegment && index >= selectedSegment.start && index <= selectedSegment.end
                      ? 'highlight-segment'
                      : 'hover:bg-primary-100/50 dark:hover:bg-primary-900/30'
                  } ${
                    currentWordIndex === index && isSpeaking ? 'shadow-lg shadow-primary-500/30' : ''
                  } ${isRTL ? 'font-arabic' : ''}`}
                  style={{
                    fontSize: highlightedWord === index ? '1.1rem' : '0.95rem',
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">📖</span>
            <span>{wordCount} {wordCount === 1 ? t.word : t.words}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">⏸️</span>
            <span>{t.pauseLabel}: {pauseDuration}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">🔄</span>
            <span>{t.repetition}: {repeatCount === 0 ? t.infinite : repeatCount}</span>
            {repeatCounter > 0 && <span className="text-xs bg-primary-500/20 px-2 py-0.5 rounded-full">#{repeatCounter + 1}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">⏱️</span>
            <span>{formatTime(elapsedTime)}</span>
          </div>
          {selectedSegment && (
            <div className="flex items-center gap-2 bg-primary-500/10 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-primary-500" />
              <span className="text-xs">
                {language === 'ar' ? 'الجزء المحدد' : 'Segmento seleccionado'}: {selectedSegment.start + 1} → {selectedSegment.end + 1}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
