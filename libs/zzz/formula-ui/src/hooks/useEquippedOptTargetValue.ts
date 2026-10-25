import { useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { useMemo } from 'react'
import { listingReadForRef } from '../catalogListing'
import { useCharCatalogRows } from './useCharCatalogRows'
import { useResolvedOptTarget } from './useResolvedOptTarget'
import { useZzzCalcContext } from './useZzzCalcContext'

/** Optimization-target value for the currently equipped build. */
export function useEquippedOptTargetValue(): number | undefined {
  const character = useCharacterContext()
  const calc = useZzzCalcContext()
  const { ref } = useResolvedOptTarget()
  const { rows } = useCharCatalogRows(character?.key, calc)
  return useMemo(() => {
    if (!character || !calc || !ref) return undefined
    const read = listingReadForRef(ref, rows)
    if (!read) return undefined
    return calc
      .withTag({
        src: character.key,
        dst: character.key,
        preset: 'preset0',
      })
      .compute(read).val
  }, [character, calc, ref, rows])
}
