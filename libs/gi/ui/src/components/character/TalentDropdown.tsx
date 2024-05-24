import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { talentLimits } from '@genshin-optimizer/gi/consts'
import { CharacterContext } from '@genshin-optimizer/gi/db-ui'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { input } from '@genshin-optimizer/gi/wr'
import { MenuItem } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { DataContext } from '../../context'

export function TalentDropdown({
  talentKey,
  setTalent,
  dropDownButtonProps,
}: {
  talentKey: keyof ICharacter['talent']
  setTalent: (talent: number) => void
  dropDownButtonProps?: Omit<DropdownButtonProps, 'title' | 'children'>
}) {
  const { t } = useTranslation('sheet_gen')

  const {
    character: { talent },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const levelBoost = data.get(input.total[`${talentKey}Boost`] as NumNode).value
  const level = data.get(input.total[talentKey]).value
  const asc = data.get(input.asc).value

  return (
    <DropdownButton
      fullWidth
      title={t('talentLvl', { level: level })}
      color={levelBoost ? 'info' : 'primary'}
      {...dropDownButtonProps}
    >
      {range(1, talentLimits[asc]).map((i) => (
        <MenuItem
          key={i}
          selected={talent[talentKey] === i}
          disabled={talent[talentKey] === i}
          onClick={() => setTalent(i)}
        >
          {t('talentLvl', { level: i + levelBoost })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
