import type { TagRowSxFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import { TagRowSxContext } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useResolvedOptTarget } from './hooks'
import { isOptTargetTag, optTargetRowSx } from './optTarget'

export function OptTargetTagRowSxProvider({
  children,
}: {
  children: ReactNode
}) {
  const { optTarget, resolvedOptTag } = useResolvedOptTarget()

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
