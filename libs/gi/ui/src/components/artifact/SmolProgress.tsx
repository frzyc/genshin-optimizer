import { clamp } from '@genshin-optimizer/common/util'
import { Box } from '@mui/material'

export function SmolProgress({ color = 'red', value = 50 }) {
  return (
    <Box
      sx={{
        width: 7,
        height: '100%',
        bgcolor: color,
        overflow: 'hidden',
        borderRadius: 1,
        display: 'inline-block',
      }}
    >
      <Box
        sx={{
          width: 10,
          height: `${100 - clamp(value, 0, 100)}%`,
          bgcolor: 'gray',
        }}
      />
    </Box>
  )
}
