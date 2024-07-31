import type { convert, selfTag } from '@genshin-optimizer/gi/formula'
import { createContext } from 'react'
export const MemberContext = createContext<ReturnType<
  typeof convert<typeof selfTag>
> | null>(null)
