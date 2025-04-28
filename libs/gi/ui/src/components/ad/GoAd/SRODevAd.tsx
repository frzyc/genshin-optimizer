import { NextImage } from '@genshin-optimizer/common/ui'
import { Link, Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import { DISCORD_LINK } from '../util'
import sro from './sro.png'
export function SRODevAd({ children }: { children: ReactNode }) {
  return (
    <Box
      component={Link}
      href={DISCORD_LINK}
      target="_blank"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: '10px',
        cursor: 'pointer',
        gap: 1,
        minHeight: '100%',
        minWidth: '100%',
      }}
    >
      {children}
      <Typography variant="h5" color="crimson">
        DO YOU WANT A STAR RAIL OPTIMIZER?
      </Typography>
      <Box component={NextImage ? NextImage : 'img'} src={sro} maxWidth={100} />

      <Typography>
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
