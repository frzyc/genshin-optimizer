import { useBoolState } from '@genshin-optimizer/common/react-util'
import { AdSenseUnit, IsAdBlockedContext } from '@genshin-optimizer/common/ui'
import { getRandomElementFromArray } from '@genshin-optimizer/common/util'
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
  height,
  width,
}: {
  dataAdSlot: string
  height?: number
  width?: number
}) {
  const [show, _, onHide] = useBoolState(true)
  const adblockEnabled = useContext(IsAdBlockedContext)
  const hostname = window.location.hostname

  if (hostname === 'frzyc.github.io' && !adblockEnabled)
    return <AdSenseUnit dataAdSlot={dataAdSlot} height={height} width={width} />
  if (!show) return null
  return (
    <GOAdWrapper height={height} width={width}>
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
  height,
  width,
  children,
}: {
  height?: number
  width?: number
  children: ReactNode
}) {
  const Comp = useMemo(() => {
    const components: Array<FunctionComponent<{ children: ReactNode }>> = [GOAd]
    if (height === undefined || canshowGoDevAd(height)) components.push(GODevAd)
    if (height === undefined || canshowSroDevAd(height))
      components.push(SRODevAd)
    if (height === undefined || canShowDrakeAd(height)) components.push(DrakeAd)
    return getRandomElementFromArray(components)
  }, [height])
  return (
    <Box
      id="go-ad-wrapper"
      sx={{
        height,
        width,
        maxHeight: height,
        maxWidth: width,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
      }}
    >
      <Comp>{children}</Comp>
    </Box>
  )
}
