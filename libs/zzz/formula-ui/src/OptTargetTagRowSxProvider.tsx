import type { TagRowSxFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import { TagRowSxContext } from '@genshin-optimizer/game-opt/sheet-ui'
import type { FormulaRef, Tag } from '@genshin-optimizer/zzz/formula'
import {
  isFormulaSheet,
  STAT_SHEET,
  sameFormula,
} from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { useResolvedOptTarget } from './hooks'

/** Inset ring so opt-target rows show on striped `FieldDisplayList` rows. */
export const optTargetRowSx = {
  boxShadow: '0px 0px 0px 2px rgba(0, 200, 0, 0.55) inset',
} as const

function tagMatchesRef(tag: Tag, ref: FormulaRef | undefined): boolean {
  if (!ref) return false
  if (ref.sheet === STAT_SHEET) return !tag.name && tag.q === ref.name
  if (!isFormulaSheet(tag.sheet) || !tag.name) return false
  return sameFormula({ sheet: tag.sheet, name: tag.name }, ref)
}

export function OptTargetTagRowSxProvider({
  children,
}: {
  children: ReactNode
}) {
  const { ref } = useResolvedOptTarget()

  const getTagRowSx = useCallback(
    (tag: Tag) => (tagMatchesRef(tag, ref) ? optTargetRowSx : undefined),
    [ref]
  )

  return (
    <TagRowSxContext.Provider value={getTagRowSx as TagRowSxFunc}>
      {children}
    </TagRowSxContext.Provider>
  )
}
