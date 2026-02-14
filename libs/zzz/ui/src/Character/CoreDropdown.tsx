import { DropdownButton, ImgIcon } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import { coreByLevel } from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function CoreDropdown() {
  const { t } = useTranslation('page_characters')
  const { database } = useDatabaseContext()
  const character = useCharacterContext()
  const { core = 0, key: characterKey, level = 1 } = character ?? {}
  const setCore = useCallback(
    (val: number) =>
      characterKey &&
      database.chars.set(characterKey, {
        core: val,
      }),
    [database, characterKey]
  )
  return (
    <DropdownButton
      fullWidth
      title={t('core', { level: core })}
      color={'primary'}
      startIcon={<ImgIcon src={commonDefIcon('core')} size={1.75} sideMargin />}
    >
      {range(0, coreByLevel(level)).map((i) => (
        <MenuItem
          key={i}
          selected={core === i}
          disabled={core === i}
          onClick={() => setCore(i)}
        >
          {t('core', { level: i })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
