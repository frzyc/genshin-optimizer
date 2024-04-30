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
        maxWidth: '100%',
        maxHeight: '100%',
        width: '100%',
        height: '100%',
      }}
      onClick={toMSite}
    >
      {children}
      <Box
        component="img"
        src={drake}
        maxWidth="100%"
        maxHeight="100%"
        width="100%"
        height="100%"
        sx={{ objectFit: 'contain' }}
      />
    </Box>
  )
}
export function canShowDrakeAd(height: number) {
  if (height < 120) return false
  return true
}
