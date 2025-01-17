import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import { StatIcon } from '@genshin-optimizer/sr/svgicons'
import type {
  DiscMainStatKey,
  DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import { discSlotToMainStatKeys } from '@genshin-optimizer/zzz/consts'
import { Box, ListItemIcon, MenuItem } from '@mui/material'
import type { ReactNode } from 'react'
import { StatDisplay } from '../Character'

export function DiscMainStatDropdown({
  statKey,
  slotKey,
  setStatKey,
  defText,
  dropdownButtonProps = {},
}: {
  statKey?: DiscMainStatKey
  slotKey?: DiscSlotKey
  setStatKey: (statKey: DiscMainStatKey) => void
  defText?: ReactNode
  dropdownButtonProps?: Omit<DropdownButtonProps, 'children' | 'title'>
}) {
  if (statKey && slotKey && slotKey in ['1', '2', '3'])
    return (
      <CardThemed sx={{ p: 1 }} bgt="light">
        <StatDisplay statKey={discSlotToMainStatKeys[slotKey][0]} showPercent />
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
      {slotKey &&
        discSlotToMainStatKeys[slotKey].map((mk) => (
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
