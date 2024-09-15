import type { StaticImageData } from 'next/image'
import type { ReactNode } from 'react'
import type { Document } from './document'

export type UISheetElement = {
  img: string | StaticImageData
  name: ReactNode
  tag?: ReactNode
  documents: Document[]
}

export type UISheet<T extends string> = Partial<Record<T, UISheetElement>>
