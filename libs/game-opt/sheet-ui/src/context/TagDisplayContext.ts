import type { Tag } from '@genshin-optimizer/game-opt/engine'
import type { ReactNode } from 'react'
import { createContext } from 'react'
export type TagDisplayComponent = (_props: {
  tag: Tag
  showPercent?: boolean
}) => ReactNode
export const TagDisplayContext = createContext<TagDisplayComponent>(
  () => undefined
)
