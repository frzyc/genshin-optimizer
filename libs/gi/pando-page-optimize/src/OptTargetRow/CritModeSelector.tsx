import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { PandoCritModeKey } from '@genshin-optimizer/gi/db'
import { pandoCritModeKeys } from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  useDatabase,
  useRequiredPandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import { Box, MenuItem } from '@mui/material'
import { useContext } from 'react'

const modeMap: Record<PandoCritModeKey, string> = {
  avg: 'Average',
  crit: 'Crit Hit',
  nonCrit: 'Non-Crit Hit',
}

export function CritModeSelector() {
  const database = useDatabase()
  const pandoTeam = useRequiredPandoTeam()
  const { character } = useContext(CharacterContext)
  const { critMode } = pandoTeam
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>Hit mode: {modeMap[critMode]}</Box>
      }
      sx={{ px: 1.5, flexShrink: 0 }}
    >
      {pandoCritModeKeys.map((k) => (
        <MenuItem
          key={k}
          selected={critMode === k}
          disabled={critMode === k}
          onClick={() =>
            database.pandoTeams.set(character.key, { critMode: k })
          }
        >
          {modeMap[k]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
