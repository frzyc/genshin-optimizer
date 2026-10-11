import { CharacterContext } from '@genshin-optimizer/gi/db-ui'
import { useContext, useMemo } from 'react'
import { listingReadForRef } from '../catalogListing'
import { useCharCatalogRows } from './useCharCatalogRows'
import { useGiCalcContext } from './useGiCalcContext'
import { useResolvedOptTarget } from './useResolvedOptTarget'

/** Optimization-target value for the currently equipped build. */
export function useEquippedOptTargetValue(): number | undefined {
  const { character } = useContext(CharacterContext)
  const calc = useGiCalcContext()
  const { ref } = useResolvedOptTarget()
  const { rows } = useCharCatalogRows(character?.key, calc)
  return useMemo(() => {
    if (!character || !calc || !ref) return undefined
    const read = listingReadForRef(ref, rows)
    if (!read) return undefined
    return calc.compute(read).val
  }, [character, calc, ref, rows])
}
