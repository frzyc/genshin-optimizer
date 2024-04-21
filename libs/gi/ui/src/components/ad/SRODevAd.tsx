import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import sro from './sro.png'
export function SRODevAd({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        backgroundColor: 'white !important',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: '10px',
        cursor: 'pointer',
        gap: 1,
      }}
      onClick={() => window.open('https://discord.gg/CXUbQXyfUs', '_blank')}
    >
      {children}
      <Typography variant="h5" color="darkred">
        DO YOU WANT A STAR RAIL OPTIMIZER?
      </Typography>
      <Box component="img" src={sro} maxWidth={100} />

      <Typography color="black">
        Exciting News! We're currently developing the Star Rail Optimizer, and
        we're on the lookout for talented web developers to join our team. If
        you're passionate about shaping the future of rail optimization, come be
        a part of our journey!
      </Typography>
    </Box>
  )
}
export function canshowSroDevAd(height: number) {
  if (height < 120) return false
  return true
}
