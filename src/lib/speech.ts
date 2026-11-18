import { useEffect, useRef, useState } from 'react'

// Dictée vocale (Chrome, Safari, Edge). Types déclarés ici : l'API n'est pas dans lib.dom.
type Rec = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start(): void
  stop(): void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}
type RecCtor = new () => Rec

const getCtor = (): RecCtor | undefined => {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

export function useDictation(onText: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const rec = useRef<Rec | null>(null)
  const cb = useRef(onText)
  cb.current = onText
  const supported = !!getCtor()

  useEffect(() => () => rec.current?.stop(), [])

  const start = () => {
    const Ctor = getCtor()
    if (!Ctor || listening) return
    const r = new Ctor()
    r.lang = 'fr-FR'
    r.interimResults = false
    r.continuous = false
    r.onresult = (e) => {
      const text = Array.from(e.results)
        .map((res) => res[0]?.transcript ?? '')
        .join(' ')
        .trim()
      if (text) cb.current(text)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    rec.current = r
    setListening(true)
    r.start()
  }
  const stop = () => rec.current?.stop()
  return { supported, listening, start, stop, toggle: () => (listening ? stop() : start()) }
}
