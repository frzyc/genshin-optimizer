import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { maxConstellationCount } from '@genshin-optimizer/gi/consts'
import { CharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { MenuItem } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export function ConstellationDropdown() {
  const {
    character: { key: characterKey, constellation },
  } = useContext(CharacterContext)
  const { t } = useTranslation('sheet_gen')
  const database = useDatabase()
  return (
    <DropdownButton
      fullWidth
      title={t('constellationLvl', { level: constellation })}
      color="primary"
    >
      {range(0, maxConstellationCount).map((i) => (
        <MenuItem
          key={i}
          selected={constellation === i}
          disabled={constellation === i}
          onClick={() =>
            database.chars.set(characterKey, {
              constellation: i,
            })
          }
        >
          {t(`constellationLvl`, { level: i })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
