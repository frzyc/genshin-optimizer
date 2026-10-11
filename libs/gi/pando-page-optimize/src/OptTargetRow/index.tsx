import { Box } from '@mui/material'
import { CritModeSelector } from './CritModeSelector'
import { DimensionSelector } from './DimensionSelector'
import { OptSelector } from './OptSelector'

const OPT_TARGET_ROW_STICKY_TOP_PX = 36

export function OptTargetRow() {
  return (
    <Box
      display="flex"
      gap={1}
      sx={{
        position: 'sticky',
        top: OPT_TARGET_ROW_STICKY_TOP_PX,
        zIndex: 100,
        bgcolor: 'background.default',
      }}
    >
      <OptSelector />
      <DimensionSelector />
      <CritModeSelector />
    </Box>
  )
}
