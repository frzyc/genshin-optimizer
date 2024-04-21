import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import drake from './drake.jpg'
export function DrakeAd({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={() =>
        window.alert(
          'Why did you click on this? You are already on Genshin optimizer!'
        )
      }
    >
      {children}
      <Box component="img" src={drake} />
    </Box>
  )
}
export function canShowDrakeAd(height: number) {
  if (height < 120) return false
  return true
}
