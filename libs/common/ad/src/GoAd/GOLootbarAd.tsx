import { Link } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import { go_lootbar_banner } from '../assets'
import type { AdDims } from '../type'
import { GO_LOOTBAR_LINK } from '../urlUtil'

function GOLootbarAd({ children }: { children: ReactNode }) {
  return (
    <Box
      component={Link}
      href={GO_LOOTBAR_LINK}
      target="_blank"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        minWidth: '100%',
        height: '100%',
        gap: 1,
      }}
    >
      {children}
      <Box
        component="img"
        src={go_lootbar_banner}
        sx={{
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: '100%',
        }}
        alt="Lootbar.gg advertisement"
      />
    </Box>
  )
}
export function getGOLootbarAd(dims: AdDims) {
  if ((dims.height ?? 120) <= 120) return GOLootbarAd
  return
}
