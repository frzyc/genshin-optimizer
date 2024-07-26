import { NextImage, useRefSize } from '@genshin-optimizer/common/ui'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import { toMainSite } from '../util'
import go from './go.png'

export function GOAd({ children }: { children: ReactNode }) {
  const { height, ref } = useRefSize()

  return (
    <Box
      ref={ref}
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
      onClick={toMainSite}
    >
      {children}
      <Box
        component={NextImage ? NextImage : 'img'}
        src={go}
        height={100}
        maxHeight={'100%'}
      />
      <Typography>
        The Ultimate Genshin Impact calculator, that allows you to min-max your
        characters according to how you play, using what you have.
      </Typography>
    </Box>
  )
}
