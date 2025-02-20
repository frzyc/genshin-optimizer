import { DropdownButton, ImgIcon } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import { coreLimits } from '@genshin-optimizer/zzz/consts'
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
  const { level = 0, promotion = 0, key: characterKey } = character ?? {}
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
      title={t('core', { level: level })}
      color={'primary'}
      startIcon={<ImgIcon src={commonDefIcon('core')} size={1.75} sideMargin />}
    >
      {range(0, coreLimits[promotion]).map((i) => (
        <MenuItem
          key={i}
          selected={level === i}
          disabled={level === i}
          onClick={() => setCore(i)}
        >
          {t('core', { level: i })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
