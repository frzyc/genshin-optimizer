import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { SpecificDmgTypeKey } from '@genshin-optimizer/zzz/db'
import { specificDmgTypeKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useCharOpt,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { damageTypeKeysMap } from '@genshin-optimizer/zzz/formula-ui'
import { Box, Button, MenuItem } from '@mui/material'
import { useCallback } from 'react'

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
    <SpecificDmgTypeDropdown
      dmgType={targetDamageType1}
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

export function SpecificDmgTypeDropdown({
  dmgType,
  setDmgType,
}: {
  dmgType?: SpecificDmgTypeKey
  setDmgType: (dmgType?: SpecificDmgTypeKey) => void
}) {
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>
          Specific Dmg Type: {dmgType ? damageTypeKeysMap[dmgType] : 'None'}
        </Box>
      }
    >
      <MenuItem
        key={'none'}
        selected={!dmgType}
        disabled={!dmgType}
        onClick={() => setDmgType()}
      >
        None
      </MenuItem>
      {specificDmgTypeKeys.map((k) => (
        <MenuItem
          key={k}
          selected={dmgType === k}
          disabled={dmgType === k}
          onClick={() => setDmgType(k)}
        >
          {damageTypeKeysMap[k]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
