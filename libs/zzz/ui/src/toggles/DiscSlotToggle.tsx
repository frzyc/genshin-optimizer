import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import { ToggleButton } from '@mui/material'

const slotHandler = handleMultiSelect([...allDiscSlotKeys])

export function DiscSlotToggle({ value, totals, onChange, ...props }: any) {
  return (
    <SolidToggleButtonGroup fullWidth value={value} size="small" {...props}>
      {allDiscSlotKeys.map((slotKey) => (
        <ToggleButton
          key={slotKey}
          sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
          value={slotKey}
        >
          {slotKey}
          {/* <Chip label={totals[slotKey]} size="small" /> */}
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
