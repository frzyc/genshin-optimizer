import {
  type TwoPcGroup,
  toggleTwoPcGroup,
  twoPcSelected,
} from '@genshin-optimizer/common/util'
import { Box, Button, Typography } from '@mui/material'
import type { ReactNode } from 'react'

/**
 * One button per 2-piece bonus. The click writes every member set into the
 * existing allowlist. An empty Pando allowlist still means every set.
 */
export function TwoPcBonusList<K extends string>({
  title,
  groups,
  allowlist,
  universe,
  onChange,
  label,
  disabled,
  resetLabel,
  emptyMeansAll = true,
}: {
  title?: ReactNode
  groups: readonly TwoPcGroup<K>[]
  allowlist: readonly K[]
  universe: readonly K[]
  onChange: (allowlist: K[]) => void
  label: (group: TwoPcGroup<K>) => ReactNode
  disabled?: boolean
  resetLabel?: string
  /** When false, an empty allowlist selects nothing. Pando filters use true. */
  emptyMeansAll?: boolean
}) {
  const selected = emptyMeansAll
    ? twoPcSelected(allowlist, universe)
    : new Set(allowlist)
  return (
    <Box>
      {(title || resetLabel) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {title && (
            <Typography sx={{ fontWeight: 'bold', flexGrow: 1 }}>
              {title}
            </Typography>
          )}
          {resetLabel && (
            <Button
              size="small"
              disabled={disabled || allowlist.length === 0}
              onClick={() => onChange([])}
            >
              {resetLabel}
            </Button>
          )}
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {groups.map((group) => {
          const included = group.sets.filter((set) => selected.has(set)).length
          const allOn = included === group.sets.length
          const someOn = included > 0 && !allOn
          return (
            <Button
              key={group.id}
              disabled={disabled}
              variant={allOn || someOn ? 'contained' : 'outlined'}
              color={allOn ? 'success' : someOn ? 'info' : 'primary'}
              onClick={() =>
                onChange(
                  toggleTwoPcGroup(
                    allowlist,
                    group.sets,
                    universe,
                    emptyMeansAll
                  )
                )
              }
            >
              {label(group)}
            </Button>
          )
        })}
      </Box>
    </Box>
  )
}
