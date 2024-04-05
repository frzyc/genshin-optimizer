import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { RefinementKey } from '@genshin-optimizer/gi/consts'
import { allRefinementKeys } from '@genshin-optimizer/gi/consts'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function RefinementDropdown({
  refinement,
  setRefinement,
  disabled = false,
}: {
  refinement: RefinementKey
  setRefinement: (r: RefinementKey) => void
  disabled?: boolean
}) {
  const { t } = useTranslation('ui')
  return (
    <DropdownButton
      title={t('refinement', { value: refinement })}
      disabled={disabled}
    >
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
