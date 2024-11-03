import { CalcContext, TagContext } from '@genshin-optimizer/pando/ui-sheet'
import type { Calculator } from '@genshin-optimizer/sr/formula'
import { useContext, useMemo } from 'react'

export function useSrCalcContext() {
  const _calc = useContext(CalcContext) as Calculator | null
  const tag = useContext(TagContext)

  return useMemo(() => _calc?.withTag(tag), [_calc, tag])
}
