import type { Read } from '@genshin-optimizer/game-opt/engine'
import { createContext } from 'react'

export type DebugReadContextObj = {
  read: Read | undefined
  setRead: (read: Read | undefined) => void
}
export const DebugReadContext = createContext<DebugReadContextObj>(
  {} as DebugReadContextObj
)
