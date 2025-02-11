import { CalcContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { Calculator } from '@genshin-optimizer/gi/formula'
import { useContext } from 'react'

export function useGiCalcContext() {
  return useContext(CalcContext) as Calculator | null
}
