import type { Unit } from '@genshin-optimizer/common/util'
import type { Tag } from '@genshin-optimizer/pando/engine'
import type { ReactNode } from 'react'

export type TagField = {
  title: ReactNode
  fieldRef: Tag
  subtitle?: ReactNode // appears after title
  icon?: ReactNode
  multi?: number // for multi-hits, displayed before a number, e.g. 3x100
  /** Overrides unit inferred from `fieldRef.q` (`%` from keys ending `_`). */
  unit?: Unit
}

export type MultiTagField = {
  title: ReactNode
  fieldRefs: Array<{ label?: ReactNode; ref: Tag }>
  subtitle?: ReactNode
  icon?: ReactNode
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

export type Field = TagField | TextField | MultiTagField

export function isTagField(field: Field): field is TagField {
  return 'fieldRef' in field
}

export function isMultiTagField(field: Field): field is MultiTagField {
  return 'fieldRefs' in field
}
