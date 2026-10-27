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
import { useTranslation } from 'react-i18next'

function critModeLabel(
  t: (key: string) => string,
  mode: PandoCritModeKey
): string {
  return t(`critMode_${mode}`)
}

export function CritModeSelector() {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const pandoTeam = useRequiredPandoTeam()
  const { character } = useContext(CharacterContext)
  const { critMode } = pandoTeam
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>
          {t('hitModeLine', { mode: critModeLabel(t, critMode) })}
        </Box>
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
          {critModeLabel(t, k)}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
