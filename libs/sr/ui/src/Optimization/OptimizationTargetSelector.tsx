import { DropdownButton } from '@genshin-optimizer/common/ui'
import { CalcContext } from '@genshin-optimizer/pando/ui-sheet'
import type { Calculator, Read } from '@genshin-optimizer/sr/formula'
import { convert, selfTag } from '@genshin-optimizer/sr/formula'
import { MenuItem } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export function OptimizationTargetSelector({
  optTarget,
  setOptTarget,
}: {
  optTarget: Read | undefined
  setOptTarget: (o: Read) => void
}) {
  const { t } = useTranslation('optimize')
  const calc = useContext(CalcContext)
  const member0 = convert(selfTag, { et: 'self', src: '0' })
  return (
    <DropdownButton
      title={`${t('optTarget')}${
        optTarget ? `: ${optTarget.tag.name || optTarget.tag.q}` : ''
      }`}
    >
      {(calc as Calculator | null)
        ?.listFormulas(member0.listing.formulas)
        .map((read, index) => (
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
