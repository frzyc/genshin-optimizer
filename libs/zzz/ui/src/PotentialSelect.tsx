import { DropdownButton } from '@genshin-optimizer/common/ui'
import { potentialLimits } from '@genshin-optimizer/zzz/consts'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function PotentialSelect({
  potential,
  setPotential,
}: {
  potential: number
  setPotential: (potential: number) => void
}) {
  const { t } = useTranslation('page_characters')

  return (
    <DropdownButton
      title={`${t('potential', { level: potential })}`}
      color="primary"
      fullWidth
    >
      {potentialLimits.map((limit) => {
        const selected = potential === limit

        return (
          <MenuItem
            key={`potential-${limit}`}
            selected={selected}
            disabled={selected}
            onClick={() => setPotential(limit)}
          >
            {`${t('potential', { level: limit })}`}
          </MenuItem>
        )
      })}
    </DropdownButton>
  )
}
