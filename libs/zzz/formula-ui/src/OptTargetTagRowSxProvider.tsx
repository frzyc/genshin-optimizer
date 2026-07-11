import type { TagRowSxFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import { TagRowSxContext } from '@genshin-optimizer/game-opt/sheet-ui'
import { getTeamFrame0, targetTag } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { isOptTargetTag, optTargetRowSx } from './optTarget'

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
    (tag: Tag) =>
      isOptTargetTag(tag, optTarget, resolvedOptTag)
        ? optTargetRowSx
        : undefined,
    [optTarget, resolvedOptTag]
  )

  return (
    <TagRowSxContext.Provider value={getTagRowSx as TagRowSxFunc}>
      {children}
    </TagRowSxContext.Provider>
  )
}
