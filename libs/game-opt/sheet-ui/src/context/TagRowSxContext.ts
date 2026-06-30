import type { Tag } from '@genshin-optimizer/game-opt-engine'
import type { SxProps, Theme } from '@mui/material'
import { createContext } from 'react'

export type TagRowSxFunc = (tag: Tag) => SxProps<Theme> | undefined

export const TagRowSxContext = createContext<TagRowSxFunc | undefined>(
  undefined
)
