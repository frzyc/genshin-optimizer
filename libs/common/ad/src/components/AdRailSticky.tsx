import { Box } from '@mui/material'
import type { FunctionComponent } from 'react'
import { AD_RAIL_HEIGHT, AD_RAIL_MAXWIDTH } from '../consts'
import type { AdProps } from '../type'
import { AdWrapper } from './AdWrapper'

const MIN_RAIL_WIDTH = 160
export function AdRailSticky({
  adWidth = 0,
  dataAdSlot = '',
  Ad,
  isRightRail = false,
}: {
  adWidth: number
  dataAdSlot: string
  Ad: FunctionComponent<AdProps>
  isRightRail?: boolean
}) {
  if (adWidth < MIN_RAIL_WIDTH) return null
  if (isRightRail && adWidth < MIN_RAIL_WIDTH * 2) return null
  const hasBothRails = adWidth >= MIN_RAIL_WIDTH * 2
  return (
    // Adding a padding of 60 ensures that there is at least 60px between ads (from top or bottom)
    <Box sx={{ flexShrink: 1, position: 'sticky', top: 0, py: '60px' }}>
      {adWidth >= MIN_RAIL_WIDTH && (
        <AdWrapper
          dataAdSlot={dataAdSlot}
          sx={{
            minWidth: MIN_RAIL_WIDTH,
            maxWidth: Math.min(
              hasBothRails ? adWidth * 0.5 : adWidth,
              AD_RAIL_MAXWIDTH
            ),
            height: AD_RAIL_HEIGHT,
            width: '100%',
          }}
          Ad={Ad}
        />
      )}
    </Box>
  )
}
