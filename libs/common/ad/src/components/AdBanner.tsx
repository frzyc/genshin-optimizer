import { Box } from '@mui/material'
import type { FunctionComponent } from 'react'
import type { AdProps } from '../type'
import { AdWrapper } from './AdWrapper'

/**
 * Banner ads that are usually put in the header/footer
 */
export function AdBanner({
  width = 0,
  dataAdSlot = '',
  Ad,
}: {
  dataAdSlot: string
  width: number
  Ad: FunctionComponent<AdProps>
}) {
  if (!width) return null

  return (
    <Box m={1}>
      <AdWrapper
        fullWidth
        dataAdSlot={dataAdSlot}
        sx={{
          height: 90,
          minWidth: 300,
          // 20 to compensate for the margin of the outer Box
          maxWidth: Math.min(1000, width - 20),
          width: '100%',
        }}
        Ad={Ad}
      />
    </Box>
  )
}
