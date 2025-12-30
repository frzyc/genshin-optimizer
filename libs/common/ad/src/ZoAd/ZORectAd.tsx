import { Link } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import type { AdDims } from '../type'
import { ZO_LINK, isZOURL } from '../urlUtil'
import zo_rect_chat from './zo_rect_chat.png'
function ZORectAd({ children }: { children: ReactNode }) {
  return (
    <Box
      component={Link}
      href={ZO_LINK}
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
        component="img"
        src={zo_rect_chat}
        maxWidth="100%"
        maxHeight="100%"
        width="100%"
        height="100%"
        sx={{ objectFit: 'contain' }}
      />
    </Box>
  )
}
export function getZORectAd(dim: AdDims) {
  if (isZOURL()) return
  if ((dim.height ?? 120) < 120) return
  if ((dim.width ?? 300) < 300) return
  return ZORectAd
}
