import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton, SqBadge } from '@genshin-optimizer/common/ui'
import type { Read } from '@genshin-optimizer/sr/formula'
import { own } from '@genshin-optimizer/sr/formula'
import { getDmgType } from '@genshin-optimizer/sr/formula-ui'
import { useSrCalcContext } from '@genshin-optimizer/sr/ui'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { OptimizationTargetDisplay } from './OptimizationTargetDisplay'

export function OptimizationTargetSelector({
  optTarget,
  setOptTarget,
  buttonProps = {},
}: {
  optTarget?: Read
  setOptTarget: (o: Read) => void
  buttonProps?: Omit<DropdownButtonProps, 'title' | 'children'>
}) {
  const { t } = useTranslation('optimize')
  const calc = useSrCalcContext()
  return (
    <DropdownButton
      title={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {t('optTarget')}
          {optTarget ? <OptimizationTargetDisplay tag={optTarget.tag} /> : null}
        </Box>
      }
      {...buttonProps}
    >
      {calc?.listFormulas(own.listing.formulas).map((read, index) => (
        <MenuItem
          key={`${index}_${read.tag.sheet || read.tag.q}_${read.tag.name}`}
          onClick={() => setOptTarget(read)}
        >
          <ListItemText>
            <OptimizationTargetDisplay tag={read.tag} />
          </ListItemText>
          {/* Show DMG type */}
          <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
            {getDmgType(read.tag).map((dmgType) => (
              <SqBadge>{dmgType}</SqBadge>
            ))}
          </Box>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
