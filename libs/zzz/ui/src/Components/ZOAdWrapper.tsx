import type { AdDims, AdProps } from '@genshin-optimizer/common/ad'
import { getGOAd, getZOLootbarAd } from '@genshin-optimizer/common/ad'
import { getGODrakeAd } from '@genshin-optimizer/common/ad'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { getRandomElementFromArray } from '@genshin-optimizer/common/util'
import { notEmpty } from '@genshin-optimizer/common/util'
import { useMemo } from 'react'
import type { FunctionComponent, ReactNode } from 'react'
/**
 * A component that aggregates all ads shown on ZO
 */
export function ZOAdWrapper({ sx = {}, bgt = 'light', children }: AdProps) {
  const maxHeight: number | undefined =
    (sx as any)?.['maxHeight'] || (sx as any)?.['height']
  const maxWidth: number | undefined =
    (sx as any)?.['maxWidth'] || (sx as any)?.['width']
  const Comp = useMemo(
    () =>
      getRandomElementFromArray(
        getAdComponents({ width: maxWidth, height: maxHeight })
      ),
    [maxHeight, maxWidth]
  )
  if (!Comp) return null
  return (
    <CardThemed
      bgt={bgt}
      className="zo-ad-wrapper"
      sx={{ margin: 'auto', ...sx }}
    >
      <Comp>{children}</Comp>
    </CardThemed>
  )
}

function getAdComponents(
  dims: AdDims
): Array<FunctionComponent<{ children: ReactNode }>> {
  return [
    getGOAd,
    // getGODevAd,
    getGODrakeAd,
    getZOLootbarAd,
  ]
    .map((c) => c(dims))
    .filter(notEmpty)
}
