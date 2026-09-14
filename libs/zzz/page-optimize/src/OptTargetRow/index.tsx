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
      display="flex"
      gap={1}
      sx={{
        position: 'sticky',
        top: 36,
        zIndex: 100,
        background: '#0C1020',
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
