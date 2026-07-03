import { getTeamFrame0, targetTag } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import { useMemo } from 'react'
import { formulaReadForTag } from '../optTarget'
import { useZzzCalcContext } from './useZzzCalcContext'

/** Optimization-target value for the currently equipped build. */
export function useEquippedOptTargetValue(): number | undefined {
  const character = useCharacterContext()
  const team = useTeam(character?.key)
  const calc = useZzzCalcContext()
  return useMemo(() => {
    if (!character || !team || !calc) return undefined
    const { tag: target } = getTeamFrame0(team)
    if (!target) return undefined
    const tag = targetTag(target)
    const read = formulaReadForTag(calc, tag)
    return calc
      .withTag({
        src: character.key,
        dst: character.key,
        preset: 'preset0',
      })
      .compute(read).val
  }, [character, team, calc])
}
