import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton, SqBadge } from '@genshin-optimizer/common/ui'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'
import { getFormula, own } from '@genshin-optimizer/zzz/formula'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { getDmgType } from '..'
import { TagDisplay } from '../../components'
import { useZzzCalcContext } from '../../hooks'

export function OptimizationTargetSelector({
  sheet,
  name,
  setOptTarget,
  buttonProps = {},
}: {
  sheet?: Sheet
  name?: string
  setOptTarget: (o: Tag) => void
  buttonProps?: Omit<DropdownButtonProps, 'title' | 'children' | 'color'>
}) {
  const calc = useZzzCalcContext()
  const formula = getFormula(sheet, name)
  return (
    <DropdownButton
      color={formula ? 'success' : 'warning'}
      title={
        formula?.tag ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* TODO: translate */}
            <strong>Optimization Target: </strong>
            {<TagDisplay tag={formula.tag} />}
          </Box>
        ) : (
          'Select an Optimization Target'
        )
      }
      {...buttonProps}
    >
      {calc?.listFormulas(own.listing.formulas).map((read, index) => (
        <MenuItem
          key={`${index}_${read.tag.sheet || read.tag.q}_${read.tag.name}`}
          onClick={() => setOptTarget(read.tag)}
        >
          <ListItemText>
            <TagDisplay tag={read.tag} />
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
