import { own } from '@genshin-optimizer/sr/formula'
import { useSrCalcContext } from '@genshin-optimizer/sr/ui'
import type { ReactNode } from 'react'

export function SuperImposeWrapper({
  children,
}: {
  children: (superimpose: number) => ReactNode
}) {
  const calc = useSrCalcContext()
  const superimpose = calc?.compute(own.lightCone.superimpose).val ?? 1
  return children(superimpose)
}
