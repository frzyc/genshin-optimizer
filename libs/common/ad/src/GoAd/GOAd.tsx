import { useRefSize } from '@genshin-optimizer/common/ui'
import { Link, Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import type { AdDims } from '../type'
import { GO_LINK, isGOURL } from '../urlUtil'
import go from './go.png'

function GOAd({ children }: { children: ReactNode }) {
  const { height, ref } = useRefSize()

  return (
    <Box
      ref={ref}
      component={Link}
      href={GO_LINK}
      target="_blank"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: '10px',
        cursor: 'pointer',
        minHeight: '100%',
        minWidth: '100%',
        height: '100%',
        flexDirection: height > 90 ? 'column' : 'row',
        gap: 1,
      }}
    >
      {children}
      <Box component="img" src={go} height={100} maxHeight={'100%'} />
      <Typography>
        The Ultimate Genshin Impact calculator, that allows you to min-max your
        characters according to how you play, using what you have.
      </Typography>
    </Box>
  )
}
export function getGOAd(_: AdDims) {
  return isGOURL() ? undefined : GOAd
}
