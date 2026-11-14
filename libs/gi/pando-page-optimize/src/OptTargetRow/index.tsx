import { Box } from '@mui/material'
import { CritModeSelector } from './CritModeSelector'
import { DimensionSelector } from './DimensionSelector'
import { OptSelector } from './OptSelector'

export function OptTargetRow() {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        '& > *': { flex: '1 1 auto', minWidth: 0 },
      }}
    >
      <OptSelector />
      <DimensionSelector />
      <CritModeSelector />
    </Box>
  )
}
