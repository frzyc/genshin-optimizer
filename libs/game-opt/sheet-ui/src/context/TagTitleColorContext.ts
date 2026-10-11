import type { Tag } from '@genshin-optimizer/game-opt/engine'
import { createContext } from 'react'

/** Game-specific title color from the *computed* tag (`ele`, heal, etc.). */
export type TagTitleColorFunc = (tag: Tag | undefined) => string | undefined

export const TagTitleColorContext = createContext<
  TagTitleColorFunc | undefined
>(undefined)
