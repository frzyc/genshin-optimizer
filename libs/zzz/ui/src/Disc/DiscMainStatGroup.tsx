import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import type {
  DiscMainStatKey,
  DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import {
  discSlotToMainStatKeys,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { Button, ButtonGroup } from '@mui/material'
import type { ReactNode } from 'react'
import { StatDisplay } from '../Character'

export function DiscMainStatGroup({
  statKey,
  slotKey,
  setStatKey,
}: {
  statKey?: DiscMainStatKey
  slotKey?: DiscSlotKey
  setStatKey: (statKey: DiscMainStatKey) => void
  defText?: ReactNode
  dropdownButtonProps?: Omit<DropdownButtonProps, 'children' | 'title'>
}) {
  if (!slotKey) return null
  if (statKey && ['1', '2', '3'].includes(slotKey))
    return (
      <CardThemed sx={{ p: 1 }} bgt="light">
        <StatDisplay statKey={discSlotToMainStatKeys[slotKey][0]} showPercent />
      </CardThemed>
    )
  return (
    <ButtonGroup>
      {slotKey &&
        discSlotToMainStatKeys[slotKey].map((stat) => (
          <BootstrapTooltip
            key={stat}
            placement="top"
            title={statKeyTextMap[stat]}
          >
            <Button
              color={statKey === stat ? 'success' : undefined}
              onClick={() => setStatKey(stat)}
              sx={{ p: 0 }}
            >
              <StatIcon statKey={stat} />
            </Button>
          </BootstrapTooltip>
        ))}
    </ButtonGroup>
  )
}
