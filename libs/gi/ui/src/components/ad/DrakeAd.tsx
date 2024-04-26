import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import drake from './drake.png'
import { toMSite } from './util'
export function DrakeAd({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        backgroundColor: 'white !important',
      }}
      onClick={toMSite}
    >
      {children}
      <Box component="img" src={drake} maxWidth="100%" maxHeight="100%" />
    </Box>
  )
}
export function canShowDrakeAd(height: number) {
  if (height < 120) return false
  return true
}
