import type { IConditionalData } from '@genshin-optimizer/common/formula'
import type { ReactNode } from 'react'
import type { Field } from './field'
import type { Header } from './header'

export type Conditional = {
  metadata: IConditionalData
  label: ReactNode
  badge?: ReactNode
  header?: Header
  fields?: Field[]
}
