import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import { Chip, ToggleButton } from '@mui/material'
import type { ReactNode } from 'react'

type DiscSlotToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: DiscSlotKey[]) => void
  value: DiscSlotKey[]
  totals: Record<DiscSlotKey, ReactNode>
}

const slotHandler = handleMultiSelect([...allDiscSlotKeys])

export function DiscSlotToggle({
  value,
  totals,
  onChange,
  ...props
}: DiscSlotToggleProps) {
  return (
    <SolidToggleButtonGroup fullWidth value={value} size="small" {...props}>
      {allDiscSlotKeys.map((slotKey) => (
        <ToggleButton
          key={slotKey}
          sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
          value={slotKey}
          onClick={() => onChange(slotHandler(value, slotKey))}
        >
          {/* <SlotIcon slotKey={slotKey} /> */}
          {slotKey}
          <Chip label={totals[slotKey]} size="small" />
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
