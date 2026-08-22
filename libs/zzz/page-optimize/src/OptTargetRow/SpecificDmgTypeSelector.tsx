import {
  type SpecificDmgTypeKey,
  getTeamFrame0,
  isGenericDmgInstTarget,
  specificDmgTypeKeys,
  withInstDamageType1,
} from '@genshin-optimizer/zzz/db'
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
        return { tag: withInstDamageType1(oldTarget, dmgType) }
      }),
    [database.teams, character.key]
  )
  if (!isGenericDmgInstTarget(target?.name)) return null
  return (
    <DmgTypeDropdown
      dmgType={target?.damageType1 as SpecificDmgTypeKey}
      keys={specificDmgTypeKeys}
      setDmgType={setDmgType}
    />
  )
}
