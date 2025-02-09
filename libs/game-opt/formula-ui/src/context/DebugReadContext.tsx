import type { BaseRead } from '@genshin-optimizer/pando/engine'
import { createContext } from 'react'

export type DebugReadContextObj = {
  read: BaseRead | undefined
  setRead: (read: BaseRead | undefined) => void
}
export const DebugReadContext = createContext<DebugReadContextObj>(
  {} as DebugReadContextObj
)
