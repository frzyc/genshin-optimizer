import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton, SqBadge } from '@genshin-optimizer/common/ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getDmgType } from '..'
import { useZzzCalcContext } from '../../hooks'
import { OptimizationTargetDisplay } from './OptimizationTargetDisplay'

export function OptimizationTargetSelector({
  optTarget,
  setOptTarget,
  buttonProps = {},
}: {
  optTarget?: Tag
  setOptTarget: (o: Tag) => void
  buttonProps?: Omit<DropdownButtonProps, 'title' | 'children'>
}) {
  const { t } = useTranslation('optimize')
  const calc = useZzzCalcContext()
  return (
    <DropdownButton
      title={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {t('optTarget')}
          {optTarget ? <OptimizationTargetDisplay tag={optTarget} /> : null}
        </Box>
      }
      {...buttonProps}
    >
      {calc?.listFormulas(own.listing.formulas).map((read, index) => (
        <MenuItem
          key={`${index}_${read.tag.sheet || read.tag.q}_${read.tag.name}`}
          onClick={() => setOptTarget(read.tag)}
        >
          <ListItemText>
            <OptimizationTargetDisplay tag={read.tag} />
          </ListItemText>
          {/* Show DMG type */}
          <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
            {getDmgType(read.tag).map((dmgType) => (
              <SqBadge key={dmgType}>{dmgType}</SqBadge>
            ))}
          </Box>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
