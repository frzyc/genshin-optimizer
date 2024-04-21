import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'

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
        minHeight: 60,
      }}
      onClick={() =>
        window.alert(
          'Why did you click on this? You are already on Genshin optimizer!'
        )
      }
    >
      {children}
      <Typography color="black">
        The Ultimate Genshin Impact calculator, that allows you to min-max your
        characters according to how you play, using what you have.
      </Typography>
    </Box>
  )
}
