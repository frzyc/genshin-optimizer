import type { Calculator } from '@genshin-optimizer/pando/engine'
import type { StaticImageData } from 'next/image'
import type { ReactNode } from 'react'
import type { Document } from './document'

export type UISheetElement = {
  img?: string | StaticImageData
  title: ReactNode
  subtitle?: ReactNode
  documents: Document[]
  disabled?: (calc: Calculator) => boolean
}

export type UISheet<T extends string> = Partial<Record<T, UISheetElement>>
