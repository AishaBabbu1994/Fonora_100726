'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type ActionType = 'explicar' | 'resumir' | 'traducir' | 'quiz'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [text, setText] = useState('🌟 ¡Bienvenido a LexiVoz, el lector interactivo con IA! Pasa el ratón por encima de cualquier palabra para iluminarla. Haz clic en cualquier palabra y la voz comenzará a leer DESDE ESA PALABRA exactamente. Selecciona texto para usar el asistente de IA en el panel derecho. Puedes cambiar la voz, la velocidad, el tono y más en el panel inferior. ¡Perfecto para aprender idiomas o seguir la lectura a tu ritmo! Configura la pausa entre palabras (0 a 5 segundos) para practicar a tu ritmo.')
  const [isReading, setIsReading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [startIndex, setStartIndex] = useState(-1)
  const [selectedText, setSelectedText] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(true)

  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [filteredVoices, setFilteredVoices] = useState<SpeechSynthesisVoice[]>([])
  const [langFilter, setLangFilter] = useState('all')
  const [rate, setRate] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [pauseWords, setPauseWords] = useState(0)
  const [repeatMode, setRepeatMode] = useState<'none' | 'seconds' | 'infinite'>('none')
  const [repeatDuration, setRepeatDuration] = useState(10)
  
  const [groqKey, setGroqKey] = useState('')
  const [aiMessages, setAiMessages] = useState<Message[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ActionType>('explicar')
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const wordsRef = useRef<HTMLSpanElement[]>([])
  const abortRef = useRef(false)
  const startIndexRef = useRef(-1)
  const langFilterRef = useRef('all')

  useEffect(() => {
    const stored = localStorage.getItem('groqApiKey') || ''
    const envKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
    setGroqKey(stored || envKey)

    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices()
      setVoices(allVoices)
      const saved = localStorage.getItem('lexivozVoice')
      const savedLang = localStorage.getItem('lexivozLang') || 'all'
      setLangFilter(savedLang)
      const filtered = savedLang === 'all' ? allVoices : allVoices.filter(v => v.lang.startsWith(savedLang))
      setFilteredVoices(filtered)
      if (filtered.length > 0) {
        const found = saved ? filtered.find(v => v.name === saved) : null
        setVoice(found || filtered[0])
      } else if (allVoices.length > 0) {
        const anyFound = saved ? allVoices.find(v => v.name === saved) : null
        setVoice(anyFound || allVoices[0])
        setFilteredVoices(allVoices)
      }
    }
    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  useEffect(() => {
    return () => { speechSynthesis.cancel() }
  }, [])

  const saveGroqKey = (key: string) => {
    setGroqKey(key)
    localStorage.setItem('groqApiKey', key)
  }

  const tokenize = (raw: string) => {
    const tokens = raw.match(/\S+|\n/g) || []
    return tokens.map((word: string, i: number) => ({
      id: i,
      text: word,
    }))
  }

  const words = tokenize(text)
  const wordCount = words.length

  const stopReading = useCallback(() => {
    abortRef.current = true
    speechSynthesis.cancel()
    setIsReading(false)
    setCurrentWordIndex(-1)
    setStartIndex(-1)
    startIndexRef.current = -1
  }, [])

  const readFromIndex = async (index: number) => {
    if (index < 0 || index >= words.length) {
      if (repeatMode === 'infinite') {
        await readFromIndex(startIndexRef.current >= 0 ? startIndexRef.current : 0)
      } else if (repeatMode === 'seconds') {
        await new Promise(r => setTimeout(r, repeatDuration * 1000))
        if (!abortRef.current) await readFromIndex(startIndexRef.current >= 0 ? startIndexRef.current : 0)
      }
      return
    }

    abortRef.current = false
    setIsReading(true)
    setCurrentWordIndex(index)

    if (index === 0 && repeatMode === 'none') {
      // Fresh start
    }

    const word = words[index]
    if (word.text.trim() === '') {
      await readFromIndex(index + 1)
      return
    }

    return new Promise<void>((resolve) => {
      const utt = new SpeechSynthesisUtterance(word.text)
      utt.voice = voice
      utt.rate = rate
      utt.pitch = pitch
      if (langFilterRef.current !== 'all') {
        utt.lang = langFilterRef.current
      }

      utt.onend = async () => {
        if (abortRef.current) { resolve(); return }
        if (pauseWords > 0) {
          await new Promise(r => setTimeout(r, pauseWords * 1000))
        }
        await readFromIndex(index + 1)
        resolve()
      }
      utt.onerror = () => { setIsReading(false); resolve() }

      utteranceRef.current = utt
      speechSynthesis.speak(utt)
    })
  }

  const handleWordClick = (index: number) => {
    if (isReading) {
      speechSynthesis.cancel()
    }
    startIndexRef.current = index
    setStartIndex(index)
    readFromIndex(index)
  }

  const handleRepeaterMode = (mode: 'none' | 'seconds' | 'infinite') => {
    setRepeatMode(mode)
    if (mode === 'none') {
      // keep reading once
    }
  }

  const handleSelection = () => {
    const selection = window.getSelection()
    const selected = selection?.toString().trim() || ''
    setSelectedText(selected)
  }

  const callGroq = async (prompt: string) => {
    if (!groqKey) {
      alert('Configura tu API key de Groq en los ajustes (⚙️) para usar el asistente de IA.')
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: 'Eres un asistente educativo amigable. Responde en español de forma clara y concisa.' },
            ...aiMessages.slice(-6),
            { role: 'user', content: prompt },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `Error ${res.status}`)
      }
      const data = await res.json()
      const reply = data.choices[0]?.message?.content || 'Sin respuesta.'
      setAiMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e: any) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${e.message}` }])
    } finally {
      setAiLoading(false)
    }
  }

  const handleAiAction = (action: ActionType) => {
    if (!selectedText) {
      alert('Selecciona texto en el lector primero para usar el asistente de IA.')
      return
    }
    const userMessages: Record<ActionType, string> = {
      explicar: `Contexto del texto: "${text.slice(0, 300)}..."\n\nExplica la siguiente selección (palabras, frases o conceptos) de forma clara, didáctica y en español:\n\n"${selectedText}"`,
      resumir: `Resume este fragmento en máximo 3 líneas, conservando las ideas principales:\n\n"${selectedText}"`,
      traducir: `Traduce el siguiente texto al inglés manteniendo el tono y el significado:\n\n"${selectedText}"`,
      quiz: `Crea 3 preguntas de comprensión lectora de opción múltiple (a, b, c, d) basadas en este fragmento. Indica la respuesta correcta:\n\n"${selectedText}"`,
    }
    setAiMessages(prev => [...prev, { role: 'user', content: userMessages[action] }])
    callGroq(userMessages[action])
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-aurora" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-aurora" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-aurora" style={{ animationDelay: '8s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center text-lg font-bold text-slate-900 shadow-lg shadow-cyan-500/30">
              L
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                LexiVoz
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Lector Interactivo con IA</p>
            </div>
          </div>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="btn btn-ghost">
            ⚙️ Ajustes
          </button>
        </header>

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />
            <div className="relative glass-strong p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4">⚙️ Configuración</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">API Key de Groq</label>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => saveGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <p className="text-xs text-slate-400 mt-1">Se guarda en tu navegador localmente. Obligatorio para el asistente de IA.</p>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="btn btn-primary w-full">
                  Guardar y Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="glass p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Velocidad</span>
              <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-24 accent-cyan-400" />
              <span className="text-xs font-mono w-10">{rate.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Tono</span>
              <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-24 accent-teal-400" />
              <span className="text-xs font-mono w-10">{pitch.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Pausa (s)</span>
              <input type="number" min="0" max="5" step="0.5" value={pauseWords} onChange={(e) => setPauseWords(parseFloat(e.target.value))} className="w-16 bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-center" />
            </div>
            <select value={langFilter} onChange={(e) => {
              const val = e.target.value
              setLangFilter(val)
              langFilterRef.current = val
              localStorage.setItem('lexivozLang', val)
              const filtered = val === 'all' ? voices : voices.filter(v => v.lang.startsWith(val))
              setFilteredVoices(filtered)
              if (filtered.length > 0) {
                const saved = localStorage.getItem('lexivozVoice')
                const found = saved ? filtered.find(v => v.name === saved) : null
                setVoice(found || filtered[0])
              } else {
                setVoice(null)
              }
            }} className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              <option value="all">🌐 Todos</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Francés</option>
              <option value="zh">🇨🇳 Chino</option>
              <option value="pt">🇧🇷 Portugués</option>
            </select>
            <select value={voice?.name} onChange={(e) => {
              const v = filteredVoices.find(v => v.name === e.target.value) || voices.find(v => v.name === e.target.value)
              if (v) { setVoice(v); localStorage.setItem('lexivozVoice', v.name) }
            }} className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              {(filteredVoices.length > 0 ? filteredVoices : voices).map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Repetir</span>
              <select value={repeatMode} onChange={(e) => handleRepeaterMode(e.target.value as any)} className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
                <option value="none">No</option>
                <option value="infinite">Infinito</option>
                <option value="seconds">Por segundos</option>
              </select>
              {repeatMode === 'seconds' && (
                <input type="number" min="1" max="3600" value={repeatDuration} onChange={(e) => setRepeatDuration(Number(e.target.value))} className="w-16 bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-center" />
              )}
            </div>
            <button onClick={stopReading} className="btn btn-ghost ml-auto border-red-500/30 hover:bg-red-500/10 hover:text-red-300">
              ⏹ Parar
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reader */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass p-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-40 bg-transparent p-4 text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-500"
                placeholder="Escribe o pega tu texto aquí..."
              />
            </div>

            {/* Text Display */}
            <div className="glass p-6 min-h-[300px]">
              <div onMouseUp={handleSelection} className="text-lg leading-loose select-text">
                {words.map((word, i) => {
                  const isReading = currentWordIndex === i
                  const isRead = startIndex >= 0 && i >= startIndex && i < currentWordIndex
                  return (
                    <span
                      key={word.id}
                      ref={el => { if (el) wordsRef.current[i] = el }}
                      className={`word-span ${isReading ? 'reading' : ''} ${isRead ? 'read' : ''}`}
                      onClick={() => handleWordClick(i)}
                      onMouseEnter={() => wordsRef.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    >
                      {word.text}{' '}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>📖 {wordCount} palabras</span>
              <span>🔄 Repetición: {repeatMode === 'none' ? 'inactiva' : repeatMode === 'infinite' ? '∞ infinito' : `${repeatDuration}s`}</span>
              <span>{isReading ? '🔊 Leyendo...' : '💤 En espera'}</span>
            </div>
          </div>

          {/* AI Panel */}
          <div className={`glass flex flex-col ${aiPanelOpen ? '' : 'hidden lg:flex'}`}>
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">🤖 Asistente IA (Groq)</h3>
                <button onClick={() => setAiPanelOpen(!aiPanelOpen)} className="text-xs text-slate-400 hover:text-white lg:hidden">
                  {aiPanelOpen ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['explicar', 'resumir', 'traducir', 'quiz'] as ActionType[]).map(action => (
                  <button key={action} onClick={() => handleAiAction(action)} disabled={aiLoading} className="btn btn-ghost text-xs capitalize">
                    {action}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Primero selecciona texto en el lector.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide max-h-[500px]">
              {aiMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-xs text-slate-400">Selecciona una frase y elige una acción para comenzar.</p>
                </div>
              )}
              {aiMessages.map((m, i) => (
                <div key={i} className={`text-sm p-3 rounded-xl ${m.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/20 ml-4' : 'bg-white/5 border border-white/5 mr-4'}`}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{m.role === 'user' ? 'Tú' : 'LexiVoz AI'}</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                </div>
              ))}
              {aiLoading && (
                <div className="text-xs text-slate-400 italic mr-4">Pensando...</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            💡 Haz clic en CUALQUIER palabra para leer desde ahí · Pasa el ratón para iluminar · Pausa configurable de 0 a 5 segundos · Repetición ajustable · IA asistida por Groq
          </p>
        </div>
      </div>
    </div>
  )
}
