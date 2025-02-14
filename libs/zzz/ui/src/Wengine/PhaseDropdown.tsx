import { DropdownButton } from '@genshin-optimizer/common/ui'
import { allRefinementKeys } from '@genshin-optimizer/gi/consts'
import type { PhaseKey } from '@genshin-optimizer/zzz/consts'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function PhaseDropdown({
  phase,
  setPhase,
  disabled = false,
}: {
  phase: PhaseKey
  setPhase: (r: PhaseKey) => void
  disabled?: boolean
}) {
  const { t } = useTranslation('ui')
  return (
    <DropdownButton title={t('phase', { value: phase })} disabled={disabled}>
      {allRefinementKeys.map((r) => (
        <MenuItem
          key={r}
          onClick={() => setPhase(r)}
          selected={phase === r}
          disabled={phase === r}
        >
          {t('phase', { value: r })}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
