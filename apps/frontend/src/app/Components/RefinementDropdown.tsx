import type { RefinementKey } from '@genshin-optimizer/consts'
import { allRefinementKeys } from '@genshin-optimizer/consts'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import DropdownButton from './DropdownMenu/DropdownButton'

export default function RefinementDropdown({
  refinement,
  setRefinement,
}: {
  refinement: RefinementKey
  setRefinement: (r: RefinementKey) => void
}) {
  const { t } = useTranslation('ui')
  return (
    <DropdownButton title={t('refinement', { value: refinement })}>
      {allRefinementKeys.map((r) => (
        <MenuItem
          key={r}
          onClick={() => setRefinement(r)}
          selected={refinement === r}
          disabled={refinement === r}
        >
          {t('refinement', { value: r })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
