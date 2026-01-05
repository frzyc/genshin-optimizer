import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { critModeKey } from '@genshin-optimizer/zzz/db'
import { critModeKeys } from '@genshin-optimizer/zzz/db'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { Box, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function CritModeSelector() {
  const { t } = useTranslation('page_optimize')
  const { database } = useDatabaseContext()
  const character = useCharacterContext()!
  const charOpt = useCharOpt(character.key)!
  const { critMode } = charOpt
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>
          {t('hitMode')} {t(critMode)}
        </Box>
      }
    >
      {critModeKeys.map((k) => (
        <MenuItem
          key={k}
          selected={critMode === k}
          disabled={critMode === k}
          onClick={() => database.charOpts.set(character.key, { critMode: k })}
        >
          {t(k)}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
