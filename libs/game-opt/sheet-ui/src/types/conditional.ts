import type {
  Calculator,
  IConditionalData,
  Tag,
} from '@genshin-optimizer/game-opt/engine'
import type { ReactNode } from 'react'
import type { Field } from './field'
import type { Header } from './header'

export type Conditional = {
  metadata: IConditionalData
  label:
    | ReactNode
    | ((calc: Calculator<Tag, 'floor'>, value: number) => ReactNode)
  badge?:
    | ReactNode
    | ((calc: Calculator<Tag, 'floor'>, value: number) => ReactNode)
  header?: Header
  fields?: Field[]
  targeted?: boolean
}
