import type { Calculator } from '@genshin-optimizer/gi/formula'
import { CalcContext } from '@genshin-optimizer/pando/ui-sheet'
import { useContext } from 'react'

export function useGiCalcContext() {
  return useContext(CalcContext) as Calculator | null
}
