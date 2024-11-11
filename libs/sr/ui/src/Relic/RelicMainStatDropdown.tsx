import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import type {
  RelicMainStatKey,
  RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import { relicSlotToMainStatKeys } from '@genshin-optimizer/sr/consts'
import { StatIcon } from '@genshin-optimizer/sr/svgicons'
import { Box, ListItemIcon, MenuItem } from '@mui/material'
import type { ReactNode } from 'react'
import { StatDisplay } from '../Character'

export function RelicMainStatDropdown({
  statKey,
  slotKey,
  setStatKey,
  defText,
  dropdownButtonProps = {},
}: {
  statKey?: RelicMainStatKey
  slotKey: RelicSlotKey
  setStatKey: (statKey: RelicMainStatKey) => void
  defText?: ReactNode
  dropdownButtonProps?: Omit<DropdownButtonProps, 'children' | 'title'>
}) {
  if ((slotKey === 'head' || slotKey === 'hands') && statKey)
    return (
      <CardThemed sx={{ p: 1 }} bgt="light">
        <StatDisplay
          statKey={relicSlotToMainStatKeys[slotKey][0]}
          showPercent
        />
      </CardThemed>
    )
  return (
    <DropdownButton
      startIcon={statKey ? <StatIcon statKey={statKey} /> : undefined}
      title={
        <Box>
          {statKey ? (
            <StatDisplay statKey={statKey} showPercent disableIcon />
          ) : (
            defText
          )}
        </Box>
      }
      {...dropdownButtonProps}
    >
      {relicSlotToMainStatKeys[slotKey].map((mk) => (
        <MenuItem
          key={mk}
          selected={statKey === mk}
          disabled={statKey === mk}
          onClick={() => setStatKey(mk)}
        >
          <ListItemIcon>
            <StatIcon statKey={mk} />
          </ListItemIcon>
          <StatDisplay statKey={mk} showPercent disableIcon />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
