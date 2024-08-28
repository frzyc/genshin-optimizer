import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { Read } from '@genshin-optimizer/sr/formula'
import { own } from '@genshin-optimizer/sr/formula'
import { useSrCalcContext } from '@genshin-optimizer/sr/formula-ui'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function OptimizationTargetSelector({
  optTarget,
  setOptTarget,
}: {
  optTarget: Read | undefined
  setOptTarget: (o: Read) => void
}) {
  const { t } = useTranslation('optimize')
  const calc = useSrCalcContext()
  return (
    <DropdownButton
      title={`${t('optTarget')}${
        optTarget ? `: ${optTarget.tag.name || optTarget.tag.q}` : ''
      }`}
    >
      {calc?.listFormulas(own.listing.formulas).map((read, index) => (
        <MenuItem
          key={`${index}_${read.tag.name || read.tag.q}`}
          onClick={() => setOptTarget(read)}
        >
          {read.tag.name || read.tag.q}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
