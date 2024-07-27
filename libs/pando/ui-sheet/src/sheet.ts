import type { Document } from './document'

export type UISheetElement = {
  documents: Document[]
}

export type UISheet<T extends string> = Partial<Record<T, UISheetElement>>
