import type { UIData } from '@genshin-optimizer/gi/ui'
import type { NumNode } from '@genshin-optimizer/gi/wr'

export interface IBasicFieldDisplay {
  canShow?: (data: UIData) => boolean
  text: Displayable
  value?: number | Displayable | ((data: UIData) => number | Displayable)
  fixed?: number
  variant?: string | ((data: UIData) => string)
  unit?: Displayable
  textSuffix?: Displayable
}

export interface INodeFieldDisplay {
  canShow?: (data: UIData) => boolean
  node: NumNode
}

export type IFieldDisplay = INodeFieldDisplay | IBasicFieldDisplay
