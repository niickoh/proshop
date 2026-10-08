import { create } from 'zustand'

/** Los avisos se ocultan solos tras este tiempo. */
export const NOTICE_DURATION_MS = 5_000

export type AdminNotice = {
  /** Distingue dos avisos con el mismo texto (reinicia el temporizador). */
  id: number
  message: string
  action?: { label: string; onClick: () => void }
}

type NoticeState = {
  notice: AdminNotice | null
  showNotice: (notice: Omit<AdminNotice, 'id'>) => void
  dismissNotice: () => void
}

let nextId = 0

/** Aviso del panel (ej. "Producto guardado"). Sobrevive a la navegación entre páginas del panel. */
export const useAdminNotice = create<NoticeState>((set) => ({
  notice: null,
  showNotice: (notice) => set({ notice: { ...notice, id: ++nextId } }),
  dismissNotice: () => set({ notice: null }),
}))
