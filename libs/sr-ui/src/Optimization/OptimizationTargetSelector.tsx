import type { Read } from '@genshin-optimizer/sr-formula'
import { convert, selfTag } from '@genshin-optimizer/sr-formula'
import { DropdownButton } from '@genshin-optimizer/ui-common'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useCalcContext } from '../Context'

export function OptimizationTargetSelector({
  optTarget,
  setOptTarget,
}: {
  optTarget: Read | undefined
  setOptTarget: (o: Read) => void
}) {
  const { t } = useTranslation('optimize')
  const { calc } = useCalcContext()
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  return (
    <DropdownButton
      title={`${t('optTarget')}${
        optTarget ? `: ${optTarget.tag.name || optTarget.tag.q}` : ''
      }`}
    >
      {calc?.listFormulas(member0.listing.formulas).map((read, index) => (
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
