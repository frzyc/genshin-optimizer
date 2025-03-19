import type { SpecificDmgTypeKey } from '@genshin-optimizer/zzz/db'
import { specificDmgTypeKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { damageTypeKeysMap } from '@genshin-optimizer/zzz/formula-ui'
import { Button } from '@mui/material'
import { useCallback } from 'react'
import { DmgTypeDropdown } from './DmgTypeDropdown'

export function SpecificDmgTypeSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { targetDamageType1, targetName } = charOpt
  const setDmgType = useCallback(
    (dmgType?: SpecificDmgTypeKey) =>
      database.charOpts.set(character.key, { targetDamageType1: dmgType }),
    [database, character.key]
  )
  if (targetName !== 'standardDmgInst') return null
  return (
    <DmgTypeDropdown
      dmgType={targetDamageType1}
      keys={specificDmgTypeKeys}
      setDmgType={setDmgType}
    />
  )
}
export function AfterShockToggle() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { targetDamageType2, targetName } = charOpt
  const setAfterShock = useCallback(
    (aftershock: boolean) =>
      database.charOpts.set(character.key, {
        targetDamageType2: aftershock ? 'aftershock' : undefined,
      }),
    [database, character.key]
  )
  if (targetName !== 'standardDmgInst') return null
  return (
    <AfterShockToggleButton
      isAftershock={targetDamageType2 === 'aftershock'}
      setAftershock={setAfterShock}
    />
  )
}
export function AfterShockToggleButton({
  isAftershock,
  setAftershock,
}: {
  isAftershock: boolean
  setAftershock: (aftershock: boolean) => void
}) {
  return (
    <Button
      onClick={() => setAftershock(!isAftershock)}
      color={isAftershock ? 'success' : 'secondary'}
    >
      {damageTypeKeysMap.aftershock}
    </Button>
  )
}
