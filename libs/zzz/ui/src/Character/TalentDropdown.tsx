import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { coreLimits, talentLimits } from '@genshin-optimizer/zzz/consts'
import { CharacterContext } from '@genshin-optimizer/zzz/db-ui'
import type { ICharacter } from '@genshin-optimizer/zzz/zood'
import { MenuItem } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export function TalentDropdown({
  talentKey,
  setTalent,
  dropDownButtonProps,
}: {
  talentKey?: keyof ICharacter['talent']
  setTalent: (talent: number) => void
  dropDownButtonProps?: Omit<DropdownButtonProps, 'title' | 'children'>
}) {
  const { t } = useTranslation('page_characters')
  const { character } = useContext(CharacterContext)
  const level = talentKey ? character.talent[talentKey] : character.core
  const asc = character.ascension

  return (
    <DropdownButton
      fullWidth
      title={t(`talent.${talentKey ?? 'core'}`, { level: level })}
      color={'primary'}
      {...dropDownButtonProps}
    >
      {talentKey
        ? range(1, talentLimits[asc]).map((i) => (
            <MenuItem
              key={i}
              selected={level === i}
              disabled={level === i}
              onClick={() => setTalent(i)}
            >
              {t(`talent.${talentKey}`, { level: i })}
            </MenuItem>
          ))
        : range(0, coreLimits[asc]).map((i) => (
            <MenuItem
              key={i}
              selected={level === i}
              disabled={level === i}
              onClick={() => setTalent(i)}
            >
              {t(`talent.core`, { level: i })}
            </MenuItem>
          ))}
      {}
    </DropdownButton>
  )
}
