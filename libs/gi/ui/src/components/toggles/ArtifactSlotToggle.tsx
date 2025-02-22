import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import { Chip, ToggleButton } from '@mui/material'
import type { ReactNode } from 'react'

type ArtifactSlotToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: ArtifactSlotKey[]) => void
  value: ArtifactSlotKey[]
  totals: Record<ArtifactSlotKey, ReactNode>
}

const slotHandler = handleMultiSelect([...allArtifactSlotKeys])

export function ArtifactSlotToggle({
  value,
  totals,
  onChange,
  ...props
}: ArtifactSlotToggleProps) {
  return (
    <SolidToggleButtonGroup fullWidth value={value} size="small" {...props}>
      {allArtifactSlotKeys.map((slotKey) => (
        <ToggleButton
          key={slotKey}
          sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
          value={slotKey}
          onClick={() => onChange(slotHandler(value, slotKey))}
        >
          <SlotIcon slotKey={slotKey} />
          <Chip label={totals[slotKey]} size="small" />
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
