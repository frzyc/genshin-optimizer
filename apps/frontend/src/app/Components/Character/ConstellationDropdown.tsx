import { useContext } from 'react'
import { CharacterContext } from '../../Context/CharacterContext'
import { DropdownButton } from '@genshin-optimizer/common/ui'
import { useTranslation } from 'react-i18next'
import { maxConstellationCount } from '@genshin-optimizer/gi/consts'
import { range } from '@genshin-optimizer/common/util'
import { MenuItem } from '@mui/material'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'

export default function ConstellationDropdown() {
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
