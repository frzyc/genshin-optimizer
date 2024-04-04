import type { UIData } from '@genshin-optimizer/gi/uidata'
import type { NumNode } from '@genshin-optimizer/gi/wr'

export interface IBasicFieldDisplay {
  canShow?: (data: UIData) => boolean
  text: ReactNode
  value?: number | ReactNode | ((data: UIData) => number | ReactNode)
  fixed?: number
  variant?: string | ((data: UIData) => string)
  unit?: ReactNode
  textSuffix?: ReactNode
}

export interface INodeFieldDisplay {
  canShow?: (data: UIData) => boolean
  node: NumNode
}

export type IFieldDisplay = INodeFieldDisplay | IBasicFieldDisplay
