import type { ReactNode } from 'react'
import type { Field } from './field'
import type { Header } from './header'

export type Conditional = {
  metadata: {
    // TODO: hoist IConditionalData of gi/sr meta.ts to be accessible here
    type: 'bool' | 'list' | 'num'
    [x: string]: string | null
  }
  label: ReactNode
  badge?: ReactNode
  header?: Header
  fields?: Field[]
}
