import type { MainSubStatKey } from '@genshin-optimizer/gi/consts'
import { createContext } from 'react'
export type OptTargetContextObj = {
  target: string[] | undefined
  scalesWith: Set<MainSubStatKey>
}
export const defOptTargetContextObj = {
  target: undefined,
  scalesWith: new Set(),
} as OptTargetContextObj
export const OptTargetContext = createContext(defOptTargetContextObj)
