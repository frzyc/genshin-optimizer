import type { Calculator } from '@genshin-optimizer/pando/engine'
import type { ReactNode } from 'react'
import type { Conditional } from './conditional'
import type { Field } from './field'
import type { Header } from './header'

export type Document = TextDocument | FieldsDocument | ConditionalDocument

export interface TextDocument extends BaseDocument {
  type: 'text'
  text: ReactNode | ((calc: Calculator) => ReactNode)
}
export interface FieldsDocument extends BaseDocument {
  type: 'fields'
  fields: Field[]
}
export interface ConditionalDocument extends BaseDocument {
  type: 'conditional'
  conditional: Conditional
}

export interface BaseDocument {
  type: string
  header?: Header
}
