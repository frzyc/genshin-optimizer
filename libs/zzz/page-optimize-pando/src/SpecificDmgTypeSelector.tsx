import { DropdownButton } from '@genshin-optimizer/common/ui'
import { specificDmgTypeKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useCharOpt,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { Box, MenuItem } from '@mui/material'

export function SpecificDmgTypeSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { targetDamageType, targetName } = charOpt
  if (targetName !== 'standardDmgInst') return null
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>
          Specific Dmg Type: {targetDamageType ?? 'None'}
        </Box>
      }
    >
      {specificDmgTypeKeys.map((k) => (
        <MenuItem
          key={k}
          selected={targetDamageType === k}
          disabled={targetDamageType === k}
          onClick={() =>
            database.charOpts.set(character.key, { targetDamageType: k })
          }
        >
          {k}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
