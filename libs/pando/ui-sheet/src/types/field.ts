import type { Tag } from '@genshin-optimizer/pando/engine'
import type { ReactNode } from 'react'

export type TagField = {
  title: ReactNode
  fieldRef: Tag
  subtitle?: ReactNode // appears after title
  icon?: ReactNode
  multi?: number // for multi-hits, displayed before a number, e.g. 3x100
}

export type TextField = {
  variant?: string
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  fieldValue: ReactNode
  toFixed?: number
  unit?: string
}

export type Field = TagField | TextField

export function isTagField(field: Field): field is TagField {
  return 'fieldRef' in field
}
