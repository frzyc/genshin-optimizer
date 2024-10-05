import { CalcContext } from '@genshin-optimizer/pando/ui-sheet'
import type { Calculator } from '@genshin-optimizer/sr/formula'
import { useContext } from 'react'

export function useSrCalcContext() {
  return useContext(CalcContext) as Calculator | null
}
