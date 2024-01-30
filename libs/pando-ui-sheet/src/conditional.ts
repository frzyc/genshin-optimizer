import type { Tag } from '@genshin-optimizer/pando'
import type { Field } from './field'

export type Conditional = {
  tag: Tag
  fields: Field[]
}
