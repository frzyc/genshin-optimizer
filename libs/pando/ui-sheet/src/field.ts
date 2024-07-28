import type { Tag } from '@genshin-optimizer/pando/engine'
import type { StaticImageData } from 'next/image'
import type { ReactNode } from 'react'

export type Field = {
  title: ReactNode
  subtitle?: ReactNode
  icon?: string | StaticImageData
  fieldRef: Tag
}
