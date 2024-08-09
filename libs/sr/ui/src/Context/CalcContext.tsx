import type { Calculator } from '@genshin-optimizer/sr/formula'
import { createContext, useContext } from 'react'

export type CalcContextObj = {
  calc: Calculator | undefined
}

export const CalcContext = createContext({} as CalcContextObj)

export function useCalcContext() {
  return useContext(CalcContext)
}
