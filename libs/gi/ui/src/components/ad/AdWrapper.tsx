import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  AdSenseUnit,
  CardThemed,
  IsAdBlockedContext,
} from '@genshin-optimizer/common/ui'
import { getRandomElementFromArray } from '@genshin-optimizer/common/util'
import type { BoxProps } from '@mui/material'
import type { FunctionComponent, MouseEventHandler } from 'react'
import { type ReactNode, useContext, useMemo } from 'react'
import { AdButtons } from './AdButtons'
import { DrakeAd, canShowDrakeAd } from './GoAd/DrakeAd'
import { GOAd } from './GoAd/GOAd'
import { GODevAd, canshowGoDevAd } from './GoAd/GODevAd'
import { SRODevAd, canshowSroDevAd } from './GoAd/SRODevAd'

export function AdWrapper({
  dataAdSlot,
  fullWidth = false,
  sx,
  onClose,
  bgt = 'light',
}: {
  dataAdSlot: string
  height?: number
  width?: number
  sx?: BoxProps['sx']
  fullWidth?: boolean
  onClose?: MouseEventHandler
  bgt?: CardBackgroundColor
}) {
  const [show, _, onHide] = useBoolState(true)
  const adblockEnabled = useContext(IsAdBlockedContext)
  const hostname = window.location.hostname

  if (hostname === 'frzyc.github.io' && !adblockEnabled)
    return <AdSenseUnit dataAdSlot={dataAdSlot} sx={sx} fullWidth={fullWidth} />
  if (!show) return null
  return (
    <GOAdWrapper sx={sx} bgt={bgt}>
      <AdButtons
        onClose={
          onClose ??
          ((e) => {
            e.stopPropagation()
            onHide()
          })
        }
      />
    </GOAdWrapper>
  )
}
function GOAdWrapper({
  sx = {},
  bgt = 'light',
  children,
}: {
  sx?: BoxProps['sx']
  bgt?: CardBackgroundColor
  children: ReactNode
}) {
  const maxHeight = (sx as any)?.['maxHeight'] || (sx as any)?.['height']
  const maxWidth = (sx as any)?.['maxWidth'] || (sx as any)?.['width']
  const Comp = useMemo(() => {
    const components: Array<FunctionComponent<{ children: ReactNode }>> = [GOAd]
    if (maxHeight === undefined || canshowGoDevAd(maxHeight))
      components.push(GODevAd)
    if (maxHeight === undefined || canshowSroDevAd(maxHeight))
      components.push(SRODevAd)
    if (maxHeight === undefined || canShowDrakeAd(maxHeight, maxWidth))
      components.push(DrakeAd)
    return getRandomElementFromArray(components)
  }, [maxHeight, maxWidth])
  return (
    <CardThemed
      bgt={bgt}
      className="go-ad-wrapper"
      sx={{ margin: 'auto', ...sx }}
    >
      <Comp>{children}</Comp>
    </CardThemed>
  )
}
