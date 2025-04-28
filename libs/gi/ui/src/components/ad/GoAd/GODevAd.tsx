import { Link, Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import { DISCORD_LINK } from '../util'

export function GODevAd({ children }: { children: ReactNode }) {
  return (
    <Box
      component={Link}
      href={DISCORD_LINK}
      target="_blank"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: '10px',
        cursor: 'pointer',
        minHeight: '100%',
        minWidth: '100%',
      }}
    >
      {children}
      <Typography variant="h5" color="crimson">
        WE NEED HELP!
      </Typography>
      <Typography>
        Are you a web developer who is looking to contribute to the most
        over-engineered Genshin website ever made? Can you distinguish which one
        of the following is a pokemon?
      </Typography>
      <Typography color="coral" fontFamily="monospace">
        React MaterialUI nx ekans GraphQL git metapod NextJS discord.js vite
        nodeJS emotion prisma Agumon tesseract.js typescript bun sawk webpack
        next-auth jest
      </Typography>
      <Typography>
        If you have knowledge in some(or any) of those technologies mentioned
        above, or are hoping to learn in an actively-developed app with
        thousands of users, please join our Discord! We'd love to work with you.
      </Typography>
    </Box>
  )
}
export function canshowGoDevAd(height: number) {
  if (height < 120) return false
  return true
}
