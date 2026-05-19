import type { TagRowSxFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import { TagRowSxContext } from '@genshin-optimizer/game-opt/sheet-ui'
import { useCharOpt, useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { isOptTargetTag, optTargetRowSx } from './optTarget'

export function OptTargetTagRowSxProvider({
  children,
}: {
  children: ReactNode
}) {
  const character = useCharacterContext()
  const charOpt = useCharOpt(character?.key)

  const getTagRowSx = useCallback(
    (tag: Tag) =>
      isOptTargetTag(tag, charOpt?.target) ? optTargetRowSx : undefined,
    [charOpt?.target]
  )

  return (
    <TagRowSxContext.Provider value={getTagRowSx as TagRowSxFunc}>
      {children}
    </TagRowSxContext.Provider>
  )
}
