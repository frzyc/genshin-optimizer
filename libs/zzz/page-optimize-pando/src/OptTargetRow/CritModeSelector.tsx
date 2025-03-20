import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { critModeKey } from '@genshin-optimizer/zzz/db'
import { critModeKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { Box, MenuItem } from '@mui/material'

// TODO: translation
const modeMap: Record<critModeKey, string> = {
  avg: 'Average',
  crit: 'Crit Hit',
  nonCrit: 'Non-Crit Hit',
}
export function CritModeSelector() {
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { critMode } = charOpt
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>Hit mode: {modeMap[critMode]}</Box>
      }
    >
      {critModeKeys.map((k) => (
        <MenuItem
          key={k}
          selected={critMode === k}
          disabled={critMode === k}
          onClick={() => database.charOpts.set(character.key, { critMode: k })}
        >
          {modeMap[k]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
