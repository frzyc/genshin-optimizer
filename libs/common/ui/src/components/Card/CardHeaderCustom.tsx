import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
/**
 * A Cardheader thta also has space for an avatar element
 */
export function CardHeaderCustom({
  avatar,
  title,
  action,
  compact = false,
}: {
  avatar?: ReactNode
  title: ReactNode
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <Box
      display="flex"
      gap={1}
      p={compact ? 1.5 : 2}
      alignItems="center"
    >
      {avatar}
      <Typography
        variant={compact ? 'subtitle2' : 'subtitle1'}
        sx={{ flexGrow: 1 }}
      >
        {title}
      </Typography>
      {action && <Typography variant="caption">{action}</Typography>}
    </Box>
  )
}
