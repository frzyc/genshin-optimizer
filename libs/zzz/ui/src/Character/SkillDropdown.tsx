import { DropdownButton, ImgIcon } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import type { SkillKey } from '@genshin-optimizer/zzz/consts'
import { skillByLevel } from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { MenuItem } from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function SkillDropdown({ skillKey }: { skillKey: SkillKey }) {
  const { database } = useDatabaseContext()
  const { t } = useTranslation('page_characters')
  const character = useCharacterContext()
  const {
    [skillKey]: level = 0,
    key: characterKey,
    level: charLevel = 1,
  } = character ?? {}
  const setSkill = useCallback(
    (val: number) =>
      characterKey &&
      database.chars.set(characterKey, {
        [skillKey]: val,
      }),
    [database, characterKey, skillKey]
  )
  return (
    <DropdownButton
      fullWidth
      title={t(skillKey, { level: level })}
      color={'primary'}
      startIcon={
        <ImgIcon src={commonDefIcon(skillKey)} size={1.75} sideMargin />
      }
    >
      {range(1, skillByLevel(charLevel)).map((i) => (
        <MenuItem
          key={i}
          selected={level === i}
          disabled={level === i}
          onClick={() => setSkill(i)}
        >
          {t(skillKey, { level: i })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
