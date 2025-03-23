import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { DamageType } from '@genshin-optimizer/zzz/formula'
import { damageTypeKeysMap } from '@genshin-optimizer/zzz/formula-ui'
import { Box, MenuItem } from '@mui/material'

export function DmgTypeDropdown<T extends DamageType>({
  dmgType,
  keys,
  setDmgType,
}: {
  dmgType?: T
  keys: T[]
  setDmgType: (dmgType?: T) => void
}) {
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>
          Dmg Type: {dmgType ? damageTypeKeysMap[dmgType] : 'Any'}
        </Box>
      }
    >
      <MenuItem
        key={'any'}
        selected={!dmgType}
        disabled={!dmgType}
        onClick={() => setDmgType()}
      >
        Any
      </MenuItem>
      {keys.map((k) => (
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
