import type { BoxProps } from '@mui/material'
import { Box } from '@mui/material'
import { useEffect } from 'react'

export function AdSenseUnit({
  dataAdSlot,
  sx = {},
}: {
  dataAdSlot: string
  sx?: BoxProps['sx']
}) {
  useEffect(() => {
    try {
      const w = window as any
      w.adsbygoogle = (window as any).adsbygoogle || []
      w.adsbygoogle.push({})
    } catch (e) {
      console.error(e)
    }
  }, [])

  return (
    <Box
      component="ins"
      className="adsbygoogle"
      sx={{ display: 'block', margin: 'auto', ...sx }}
      data-ad-client="ca-pub-2443965532085844"
      data-ad-slot={dataAdSlot}
    />
  )
}
