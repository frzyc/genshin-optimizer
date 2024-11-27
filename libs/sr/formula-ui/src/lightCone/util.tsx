import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { own } from '@genshin-optimizer/sr/formula'
import { useSrCalcContext } from '@genshin-optimizer/sr/ui'
import type { ReactNode } from 'react'

export function SuperImposeWrapper({
  lcKey,
  children,
}: {
  lcKey: LightConeKey
  children: (superimpose: number) => ReactNode
}) {
  const calc = useSrCalcContext()
  let superimpose = 1
  if (calc) {
    const hasLightCone = !!calc.compute(own.common.count.sheet(lcKey)).val
    if (hasLightCone)
      superimpose = calc.compute(own.lightCone.superimpose).val ?? 1
  }

  return children(superimpose)
}
