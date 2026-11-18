import { SITE, SLOTS } from '../config'
import { toIso } from './utils'

/** Dates des venues : une par semaine, même jour, à partir de la première. */
export function visitDates(startDate: string, weeks: number): string[] {
  if (!startDate) return []
  return Array.from({ length: Math.max(1, weeks) }, (_, i) => {
    const d = new Date(startDate + 'T12:00:00')
    d.setDate(d.getDate() + i * 7)
    return toIso(d)
  })
}

/** Prochaine venue à venir (début du créneau), ou null si tout est passé. */
export function nextVisit(dates: string[], slotId: string): { iso: string; at: Date } | null {
  const start = SLOTS.find((s) => s.id === slotId)?.start ?? 9
  const now = Date.now()
  for (const iso of dates) {
    const at = new Date(`${iso}T${String(start).padStart(2, '0')}:00:00`)
    if (at.getTime() > now) return { iso, at }
  }
  return null
}

/** « dans 3 jours », « demain », « aujourd'hui ». */
export function countdown(d: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  const n = Math.round((day.getTime() - today.getTime()) / 86400000)
  if (n <= 0) return 'aujourd’hui'
  if (n === 1) return 'demain'
  return `dans ${n} jours`
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const local = (iso: string, h: number) => `${iso.replace(/-/g, '')}T${String(h).padStart(2, '0')}0000`
// Les lignes iCalendar sont limitées à 75 caractères : on replie les plus longues.
const fold = (line: string) => line.match(/.{1,72}/g)!.join('\r\n ')

/** Fichier .ics avec une entrée par venue de la cheffe (rappel la veille). */
export function buildIcs(o: { ref: string; dates: string[]; slotId: string; location: string; description: string }) {
  const slot = SLOTS.find((s) => s.id === o.slotId) ?? SLOTS[0]
  const now = stamp(new Date())
  const events = o.dates.flatMap((iso, i) => [
    'BEGIN:VEVENT',
    `UID:${o.ref}-${i + 1}@hannanecooking`,
    `DTSTAMP:${now}`,
    `DTSTART:${local(iso, slot.start)}`,
    `DTEND:${local(iso, slot.end)}`,
    `SUMMARY:${esc(`🍳 Votre cheffe ${SITE.name}${o.dates.length > 1 ? ` (${i + 1}/${o.dates.length})` : ''}`)}`,
    `LOCATION:${esc(o.location)}`,
    `DESCRIPTION:${esc(o.description)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'TRIGGER:-P1D',
    `DESCRIPTION:${esc('Demain : votre cheffe vient cuisiner. Courses prêtes ? Espèces prévues ?')}`,
    'END:VALARM',
    'END:VEVENT',
  ])
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${SITE.name}//Reservation//FR`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events, 'END:VCALENDAR'].map(fold).join('\r\n')
}

export function downloadFile(filename: string, content: string, type = 'text/calendar;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
