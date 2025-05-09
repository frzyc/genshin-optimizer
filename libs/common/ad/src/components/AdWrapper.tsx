import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import type { BoxProps } from '@mui/material'
import type { FunctionComponent, MouseEventHandler } from 'react'
import { useContext } from 'react'
import { IsAdBlockedContext } from '../context'
import type { AdProps } from '../type'
import { AdButtons } from './AdButtons'
import { AdSenseUnit } from './AdSenseUnit'

export function AdWrapper({
  dataAdSlot,
  fullWidth = false,
  sx,
  onClose,
  bgt = 'light',
  Ad,
}: {
  dataAdSlot: string
  height?: number
  width?: number
  sx?: BoxProps['sx']
  fullWidth?: boolean
  onClose?: MouseEventHandler
  bgt?: CardBackgroundColor
  Ad: FunctionComponent<AdProps>
}) {
  const [show, _, onHide] = useBoolState(true)
  const adblockEnabled = useContext(IsAdBlockedContext)
  const hostname = window.location.hostname

  if (hostname === 'frzyc.github.io' && !adblockEnabled)
    return <AdSenseUnit dataAdSlot={dataAdSlot} sx={sx} fullWidth={fullWidth} />
  if (!show) return null
  return (
    <Ad sx={sx} bgt={bgt}>
      <AdButtons
        onClose={
          onClose ??
          ((e) => {
            e.preventDefault()
            e.stopPropagation()
            onHide()
          })
        }
      />
    </Ad>
  )
}
