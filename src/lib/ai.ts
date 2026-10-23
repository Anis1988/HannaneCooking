import type { MenuRequest, MenuResponse } from '../../api/menu'
import type { AdviceRequest, AdviceResponse } from '../../api/advice'

export type Photo = { mediaType: 'image/jpeg'; data: string; preview: string }

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Assistant indisponible pour le moment.')
  return json as T
}

export const askMenu = (body: MenuRequest) => post<MenuResponse>('/api/menu', body)
export const askAdvice = (body: AdviceRequest) => post<AdviceResponse>('/api/advice', body)

/** Réduit la photo (max 1024 px, JPEG) avant envoi : plus rapide et moins cher. */
export async function shrinkPhoto(file: File, max = 1024): Promise<Photo> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const preview = canvas.toDataURL('image/jpeg', 0.8)
  return { mediaType: 'image/jpeg', data: preview.split(',')[1], preview }
}
