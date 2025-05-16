import { NextImage } from '@genshin-optimizer/common/ui'
import { Link } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import type { AdDims } from '../type'
import { GO_LINK, isGOURL } from '../urlUtil'
import drake from './drake.png'
function GODrakeAd({ children }: { children: ReactNode }) {
  return (
    <Box
      component={Link}
      href={GO_LINK}
      target="_blank"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        maxWidth: '100%',
        maxHeight: '100%',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
      <Box
        component={NextImage ? NextImage : 'img'}
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
export function getGODrakeAd(dim: AdDims) {
  if (isGOURL()) return
  if ((dim.height ?? 120) < 120) return
  if ((dim.width ?? 300) < 300) return
  return GODrakeAd
}
