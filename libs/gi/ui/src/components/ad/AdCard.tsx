import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { CardThemed, useRefSize } from '@genshin-optimizer/common/ui'
import { Box } from '@mui/material'
import { AdWrapper } from './AdWrapper'

export function AdCard({
  dataAdSlot,
  bgt = 'normal',
  maxHeight = 350,
}: {
  dataAdSlot: string
  bgt?: CardBackgroundColor
  maxHeight?: number
}) {
  const { width, height, ref } = useRefSize()
  return (
    <CardThemed bgt={bgt} sx={{ height: '100%', maxHeight }}>
      <Box ref={ref} sx={{ height: '100%', width: '100%' }}>
        {width && (
          <AdWrapper
            dataAdSlot={dataAdSlot}
            sx={{ width, height: Math.max(height, maxHeight) }}
          />
        )}
      </Box>
    </CardThemed>
  )
}
