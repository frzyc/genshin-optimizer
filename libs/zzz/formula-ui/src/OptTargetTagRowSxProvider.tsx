import type { TagRowSxFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import { TagRowSxContext } from '@genshin-optimizer/game-opt/sheet-ui'
import { getTeamFrame0, targetTag } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { optTargetRowSx } from './optTarget'

export function OptTargetTagRowSxProvider({
  children,
}: {
  children: ReactNode
}) {
  const character = useCharacterContext()
  const team = useTeam(character?.key)
  const optTarget = team ? getTeamFrame0(team).tag : undefined
  const resolvedOptTag = useMemo(
    () => (optTarget ? targetTag(optTarget) : undefined),
    [optTarget]
  )

  const getTagRowSx = useCallback(
    (tag: Tag) => {
      if (
        resolvedOptTag &&
        tag.sheet === resolvedOptTag.sheet &&
        tag.name === resolvedOptTag.name &&
        tag.q === resolvedOptTag.q
      )
        return optTargetRowSx
      return undefined
    },
    [resolvedOptTag]
  )

  return (
    <TagRowSxContext.Provider value={getTagRowSx as TagRowSxFunc}>
      {children}
    </TagRowSxContext.Provider>
  )
}
