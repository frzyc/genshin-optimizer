import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton, SqBadge } from '@genshin-optimizer/common/ui'
import type { CharOpt } from '@genshin-optimizer/zzz/db'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'
import { getFormula, own } from '@genshin-optimizer/zzz/formula'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { getDmgType } from '..'
import { TagDisplay } from '../../components'
import { useZzzCalcContext } from '../../hooks'

export function OptimizationTargetSelector({
  sheet,
  name,
  dmgType,
  setOptTarget,
  buttonProps = {},
}: {
  sheet?: Sheet
  name?: string
  dmgType?: CharOpt['targetDamageType']
  setOptTarget: (o: Tag) => void
  buttonProps?: Omit<DropdownButtonProps, 'title' | 'children' | 'color'>
}) {
  const calc = useZzzCalcContext()
  const formula = getFormula(sheet, name)
  const tag = formula?.tag
  return (
    <DropdownButton
      color={tag ? 'success' : 'warning'}
      title={
        tag ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* TODO: translate */}
            <strong>Optimization Target: </strong>
            {<TagDisplay tag={tag} />}
            {/* Show DMG type */}
            {getDmgType({ ...tag, damageType2: dmgType }).map((dmgType) => (
              <SqBadge key={dmgType}>{dmgType}</SqBadge>
            ))}
            {/* Show Attribute */}
            {tag.attribute && (
              <SqBadge color={tag.attribute}>{tag.attribute}</SqBadge>
            )}
          </Box>
        ) : (
          'Select an Optimization Target'
        )
      }
      {...buttonProps}
    >
      {calc?.listFormulas(own.listing.formulas).map(
        ({ tag }, index) =>
          tag.name &&
          tag.sheet && (
            <MenuItem
              key={`${index}_${tag.sheet || tag.q}_${tag.name}`}
              onClick={() => setOptTarget(tag)}
            >
              <ListItemText>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TagDisplay tag={tag} />
                  {/* Show DMG type */}
                  {getDmgType(tag).map((dmgType) => (
                    <SqBadge key={dmgType}>{dmgType}</SqBadge>
                  ))}
                  {/* Show Attribute */}
                  {tag.attribute && (
                    <SqBadge color={tag.attribute}>{tag.attribute}</SqBadge>
                  )}
                </Box>
              </ListItemText>
            </MenuItem>
          )
      )}
    </DropdownButton>
  )
}
