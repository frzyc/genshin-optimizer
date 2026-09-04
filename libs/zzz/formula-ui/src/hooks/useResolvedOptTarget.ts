import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import { lookupFormulaRef } from '@genshin-optimizer/zzz/formula'
import { useMemo } from 'react'

/** Validated frame-0 FormulaRef, catalog entry, and compute tag. */
export function useResolvedOptTarget() {
  const character = useCharacterContext()
  const team = useTeam(character?.key)
  const raw = team ? getTeamFrame0(team).ref : undefined
  return useMemo(() => {
    const looked = lookupFormulaRef(raw)
    return {
      ref: looked?.ref,
      tag: looked?.tag,
      entry: looked?.entry,
    }
  }, [raw])
}
