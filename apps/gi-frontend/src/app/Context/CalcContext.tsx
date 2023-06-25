import type { Calculator } from '@genshin-optimizer/formula';
import { createContext } from 'react'

export type CalcContextObj = {
  calc: Calculator | undefined
  setCalc: (calc: Calculator | undefined) => void
}

export const CalcContext = createContext({
  calc: undefined,
  setCalc: () => {},
} as CalcContextObj)
