import type { ReactNode } from 'react'
import type { Document } from './document'

export type UISheetElement = {
  img?: string
  title: ReactNode
  subtitle?: ReactNode
  documents: Document[]
}

export type UISheet<T extends string> = Partial<Record<T, UISheetElement>>
