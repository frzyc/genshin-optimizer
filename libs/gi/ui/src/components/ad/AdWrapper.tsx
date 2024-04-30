import { useBoolState } from '@genshin-optimizer/common/react-util'
import { AdSenseUnit, IsAdBlockedContext } from '@genshin-optimizer/common/ui'
import { getRandomElementFromArray } from '@genshin-optimizer/common/util'
import type { BoxProps } from '@mui/material'
import { Box } from '@mui/material'
import type { FunctionComponent } from 'react'
import { useContext, useMemo, type ReactNode } from 'react'
import { AdButtons } from './AdButtons'
import { DrakeAd, canShowDrakeAd } from './DrakeAd'
import { GOAd } from './GOAd'
import { GODevAd, canshowGoDevAd } from './GODevAd'
import { SRODevAd, canshowSroDevAd } from './SRODevAd'

export function AdWrapper({
  dataAdSlot,
  fullWidth = false,
  sx,
}: {
  dataAdSlot: string
  height?: number
  width?: number
  sx?: BoxProps['sx']
  fullWidth?: boolean
}) {
  const [show, _, onHide] = useBoolState(true)
  const adblockEnabled = useContext(IsAdBlockedContext)
  const hostname = window.location.hostname

  if (hostname === 'frzyc.github.io' && !adblockEnabled)
    return <AdSenseUnit dataAdSlot={dataAdSlot} sx={sx} fullWidth={fullWidth} />
  if (!show) return null
  return (
    <GOAdWrapper sx={sx}>
      <AdButtons
        onClose={(e) => {
          e.stopPropagation()
          onHide()
        }}
      />
    </GOAdWrapper>
  )
}
function GOAdWrapper({
  sx = {},
  children,
}: {
  sx?: BoxProps['sx']
  children: ReactNode
}) {
  const maxHeight = (sx as any)?.['maxHeight'] || (sx as any)?.['height']
  const Comp = useMemo(() => {
    const components: Array<FunctionComponent<{ children: ReactNode }>> = [GOAd]
    if (maxHeight === undefined || canshowGoDevAd(maxHeight))
      components.push(GODevAd)
    if (maxHeight === undefined || canshowSroDevAd(maxHeight))
      components.push(SRODevAd)
    if (maxHeight === undefined || canShowDrakeAd(maxHeight))
      components.push(DrakeAd)
    return getRandomElementFromArray(components)
  }, [maxHeight])
  return (
    <Box className="go-ad-wrapper" sx={{ margin: 'auto', ...sx }}>
      <Comp>{children}</Comp>
    </Box>
  )
}
