import type { Tag } from '@genshin-optimizer/pando/engine'
import type { Field } from './field'

export type Conditional = {
  tag: Tag
  fields: Field[]
}
