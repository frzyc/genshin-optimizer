import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { critModeKey } from '@genshin-optimizer/zzz/db'
import { critModeKeys, getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
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
  const team = useTeam(character.key)!
  const { critMode } = getTeamFrame0(team)
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>Hit mode: {modeMap[critMode]}</Box>
      }
      sx={{ px: 1.5, flexShrink: 0 }}
    >
      {critModeKeys.map((k) => (
        <MenuItem
          key={k}
          selected={critMode === k}
          disabled={critMode === k}
          onClick={() =>
            database.teams.setFrame0(character.key, { critMode: k })
          }
        >
          {modeMap[k]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
