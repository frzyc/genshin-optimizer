import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
/**
 * A Cardheader thta also has space for an avatar element
 */
export function CardHeaderCustom({
  avatar,
  title,
  action,
}: {
  avatar?: ReactNode
  title: ReactNode
  action?: ReactNode
}) {
  return (
    <Box display="flex" gap={1} p={2} alignItems="center">
      {avatar}
      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
      {action && <Typography variant="caption">{action}</Typography>}
    </Box>
  )
}
