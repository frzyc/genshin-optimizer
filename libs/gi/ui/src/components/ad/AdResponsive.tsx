import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { useRefSize } from '@genshin-optimizer/common/ui'
import { Box } from '@mui/material'
import { AdWrapper } from './AdWrapper'

export function AdResponsive({
  dataAdSlot,
  bgt = 'normal',
  maxHeight = 350,
}: {
  dataAdSlot: string
  bgt?: CardBackgroundColor
  maxHeight?: number
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
        />
      )}
    </Box>
  )
}
