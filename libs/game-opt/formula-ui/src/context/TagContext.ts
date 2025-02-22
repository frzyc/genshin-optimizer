import type { Tag } from '@genshin-optimizer/pando/engine'
import { createContext } from 'react'

export const TagContext = createContext<Tag>({} as Tag)
