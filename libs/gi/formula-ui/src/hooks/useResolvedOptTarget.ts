import { CharacterContext, usePandoTeam } from '@genshin-optimizer/gi/db-ui'
import {
  lookupFormulaRef,
  validateFormulaRef,
} from '@genshin-optimizer/gi/formula'
import { useContext, useMemo } from 'react'

/** Validated pandoTeam FormulaRef, catalog entry, and compute tag. */
export function useResolvedOptTarget() {
  const { character } = useContext(CharacterContext)
  const team = usePandoTeam(character.key)
  const raw = team?.ref
  return useMemo(() => {
    const looked = lookupFormulaRef(validateFormulaRef(raw))
    return {
      ref: looked?.ref,
      tag: looked?.tag,
      entry: looked?.entry,
    }
  }, [raw])
}
