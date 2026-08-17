import type { TagRowSxFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import { TagRowSxContext } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useResolvedOptTarget } from './hooks'
import { isOptTargetTag } from './optTarget'

/** Inset ring so opt-target rows show on striped `FieldDisplayList` rows. */
export const optTargetRowSx = {
  boxShadow: '0px 0px 0px 2px rgba(0, 200, 0, 0.55) inset',
} as const

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
