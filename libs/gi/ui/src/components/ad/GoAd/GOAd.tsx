import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import { toMainSite } from '../util'

export function GOAd({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        backgroundColor: 'white !important',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: '10px',
        cursor: 'pointer',
        minHeight: '100%',
        minWidth: '100%',
      }}
      onClick={toMainSite}
    >
      {children}
      <Typography color="black">
        The Ultimate Genshin Impact calculator, that allows you to min-max your
        characters according to how you play, using what you have.
      </Typography>
    </Box>
  )
}
