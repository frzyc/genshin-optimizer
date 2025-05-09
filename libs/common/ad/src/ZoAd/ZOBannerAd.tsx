import { NextImage } from '@genshin-optimizer/common/ui'
import { Link } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import type { AdDims } from '../type'
import { ZO_LINK, isZOURL } from '../urlUtil'
import zo_banner_chat from './zo_banner_chat.png'

function ZOBannerAd({ children }: { children: ReactNode }) {
  return (
    <Box
      component={Link}
      href={ZO_LINK}
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
        component={NextImage ? NextImage : 'img'}
        src={zo_banner_chat}
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
export function getZOBannerAd(dims: AdDims) {
  if (isZOURL()) return
  if ((dims.height ?? 120) <= 120) return ZOBannerAd
  return
}
