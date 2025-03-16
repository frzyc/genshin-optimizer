import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { own } from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { useZzzCalcContext } from '../../hooks'

export function PhaseWrapper({
  wKey,
  children,
}: {
  wKey: WengineKey
  children: (phase: number) => ReactNode
}) {
  const calc = useZzzCalcContext()
  let phase = 1
  if (calc) {
    const hasWengine = !!calc.compute(own.common.count.sheet(wKey)).val
    if (hasWengine) phase = calc.compute(own.wengine.phase).val ?? 1
  }

  return children(phase)
}
