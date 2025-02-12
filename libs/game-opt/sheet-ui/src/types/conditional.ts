import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import type { GenericCalculator } from '@genshin-optimizer/game-opt/formula-ui'
import type { ReactNode } from 'react'
import type { Field } from './field'
import type { Header } from './header'

export type Conditional = {
  metadata: IConditionalData
  label: ReactNode | ((calc: GenericCalculator) => ReactNode)
  badge?: ReactNode | ((calc: GenericCalculator, value: number) => ReactNode)
  header?: Header
  fields?: Field[]
  targeted?: boolean
}
