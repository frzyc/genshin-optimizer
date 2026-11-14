import { Box } from '@mui/material'
import { AfterShockOverlayToggle } from './AfterShockOverlayToggle'
import { AttributeOverlaySelector } from './AttributeOverlaySelector'
import { CritModeSelector } from './CritModeSelector'
import { DimensionSelector } from './DimensionSelector'
import { OptSelector } from './OptSelector'
import { SpecificDmgTypeSelector } from './SpecificDmgTypeSelector'

export function OptTargetRow() {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <OptSelector />
      <DimensionSelector />
      <SpecificDmgTypeSelector />
      <AttributeOverlaySelector />
      <AfterShockOverlayToggle />
      <CritModeSelector />
    </Box>
  )
}
