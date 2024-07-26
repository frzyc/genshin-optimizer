import { NextImage } from '@genshin-optimizer/common/ui'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import { toMainSite } from '../util'
import drake from './drake.png'
export function DrakeAd({ children }: { children: ReactNode }) {
  return (
    <Box
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
      onClick={toMainSite}
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
export function canShowDrakeAd(height: number, width: number) {
  if (height < 120) return false
  if (width < 300) return false
  return true
}
