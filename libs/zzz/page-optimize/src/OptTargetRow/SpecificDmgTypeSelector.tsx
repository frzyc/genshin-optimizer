import type { SpecificDmgTypeKey } from '@genshin-optimizer/zzz/db'
import { specificDmgTypeKeys } from '@genshin-optimizer/zzz/db'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { useCallback } from 'react'
import { DmgTypeDropdown } from '../DmgTypeDropdown'

export function SpecificDmgTypeSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const team = useTeam(character.key)!
  const { tag: target } = getTeamFrame0(team)
  const setDmgType = useCallback(
    (dmgType?: SpecificDmgTypeKey) =>
      database.teams.setFrame0(character.key, (frame) => {
        const { tag: oldTarget = {} } = frame
        const { damageType1, ...oTarget } = oldTarget
        if (!dmgType) return { tag: oTarget }
        return {
          tag: { ...oTarget, damageType1: dmgType },
        }
      }),
    [database.teams, character.key]
  )
  if (target?.name !== 'standardDmgInst' && target?.name !== 'sheerDmgInst')
    return null
  return (
    <DmgTypeDropdown
      dmgType={target?.damageType1 as SpecificDmgTypeKey}
      keys={specificDmgTypeKeys}
      setDmgType={setDmgType}
    />
  )
}
