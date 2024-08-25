import type { NumNode, Tag } from '@genshin-optimizer/pando/engine'
import { createContext } from 'react'
export const MemberContext = createContext<{
  withTag: (t: Tag) => NumNode
} | null>(null)
