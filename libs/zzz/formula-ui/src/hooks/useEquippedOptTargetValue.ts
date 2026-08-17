import { getTeamFrame0, resolveTargetTag } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import { useMemo } from 'react'
import { formulaReadForTag } from '../optTarget'
import { useCharFormulaFields } from './useCharFormulaFields'
import { useZzzCalcContext } from './useZzzCalcContext'

/** Optimization-target value for the currently equipped build. */
export function useEquippedOptTargetValue(): number | undefined {
  const character = useCharacterContext()
  const team = useTeam(character?.key)
  const calc = useZzzCalcContext()
  const { readByListingKey } = useCharFormulaFields(character?.key, calc)
  return useMemo(() => {
    if (!character || !team || !calc) return undefined
    const { tag: target } = getTeamFrame0(team)
    if (!target) return undefined
    const tag = resolveTargetTag(target)
    if (!tag) return undefined
    const read = formulaReadForTag(tag, readByListingKey)
    if (!read) return undefined
    return calc
      .withTag({
        src: character.key,
        dst: character.key,
        preset: 'preset0',
      })
      .compute(read).val
  }, [character, team, calc, readByListingKey])
}
