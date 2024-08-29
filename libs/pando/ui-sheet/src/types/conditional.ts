import type { ReactNode } from 'react'
import type { Field } from './field'
import type { Header } from './header'

export type Conditional = {
  metadata: {
    [x: string]: string | null
  }
  label: ReactNode
  badge?: ReactNode
  header?: Header
  fields?: Field[]
}
