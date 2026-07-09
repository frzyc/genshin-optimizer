import type { BaseRead, Tag } from '@genshin-optimizer/pando/engine'
import { createContext } from 'react'

export type DebugReadContextObj = {
  read: BaseRead | undefined
  setRead: (read: BaseRead | undefined) => void
  // Tag from TagContext is not accurate, as the TagContext can be changed at a lower layer than where the DebugDisplay will sit
  tag: Tag | undefined
  setTag: (tag: Tag | undefined) => void
}
export const DebugReadContext = createContext<DebugReadContextObj>(
  {} as DebugReadContextObj
)
