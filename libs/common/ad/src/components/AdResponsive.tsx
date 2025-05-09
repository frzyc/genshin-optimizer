import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { useRefSize } from '@genshin-optimizer/common/ui'
import { Box } from '@mui/material'
import type { FunctionComponent } from 'react'
import type { AdProps } from '../type'
import { AdWrapper } from './AdWrapper'

export function AdResponsive({
  dataAdSlot,
  bgt = 'normal',
  maxHeight = 350,
  Ad,
}: {
  dataAdSlot: string
  bgt?: CardBackgroundColor
  maxHeight?: number
  Ad: FunctionComponent<AdProps>
}) {
  const { width, height, ref } = useRefSize()
  const [show, _, onHide] = useBoolState(true)

  if (!show) return null
  return (
    <Box ref={ref} sx={{ height: '100%', width: '100%', maxHeight }}>
      {width && (
        <AdWrapper
          bgt={bgt}
          onClose={(e) => {
            e.stopPropagation()
            onHide()
          }}
          dataAdSlot={dataAdSlot}
          sx={{ width, height: Math.max(height, maxHeight) }}
          Ad={Ad}
        />
      )}
    </Box>
  )
}
