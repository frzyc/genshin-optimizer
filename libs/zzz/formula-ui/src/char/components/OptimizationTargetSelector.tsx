import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { FullTagDisplay } from '../../components'
import { useZzzCalcContext } from '../../hooks'
const statTargets = [
  own.final.atk,
  own.final.hp,
  own.final.def,
  own.final.crit_,
  own.final.crit_dmg_,
  own.final.enerRegen,
  own.final.anomProf,
  own.final.anomMas,
]
export function OptimizationTargetSelector({
  tag,
  setOptTarget,
  buttonProps = {},
}: {
  tag?: Tag
  setOptTarget: (o: Tag) => void
  buttonProps?: Omit<DropdownButtonProps, 'title' | 'children' | 'color'>
}) {
  const calc = useZzzCalcContext()
  return (
    <DropdownButton
      color={tag ? 'success' : 'warning'}
      title={
        tag ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* TODO: translate */}
            <strong>Optimization Target: </strong>
            {<FullTagDisplay tag={tag} />}
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
                  <FullTagDisplay tag={tag} />
                </Box>
              </ListItemText>
            </MenuItem>
          )
      )}
      {statTargets.map(({ tag }, i) => (
        <MenuItem key={i} onClick={() => setOptTarget(tag)}>
          <ListItemText>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FullTagDisplay tag={tag} />
            </Box>
          </ListItemText>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
