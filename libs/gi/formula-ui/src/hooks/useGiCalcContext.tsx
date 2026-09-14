import { CalcContext, TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { Calculator } from '@genshin-optimizer/gi/formula'
import { useContext, useMemo } from 'react'

export function useGiCalcContext() {
  const _calc = useContext(CalcContext) as Calculator | null
  const tag = useContext(TagContext)

  // GI listings must be gathered with member `src` (see Noelle.spec). Untagged
  // gather matches every sheet's formula listings and freezes the tab.
  return useMemo(() => _calc?.withTag(tag), [_calc, tag])
}

/** Calc for the current GI Pando tree. Requires `CharCalcProvider`. */
export function useRequiredGiCalcContext(): Calculator {
  const calc = useGiCalcContext()
  if (!calc) throw new Error('Missing GI CalcContext')
  return calc
}
