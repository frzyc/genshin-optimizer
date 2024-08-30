import { Typography } from '@mui/material'
import type { ReactNode } from 'react'

export function Tally({ children }: { children: ReactNode }) {
  return (
    <Typography sx={{ opacity: 0.7, lineHeight: 1 }} variant="caption">
      {children}
    </Typography>
  )
}
