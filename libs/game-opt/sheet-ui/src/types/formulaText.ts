import type { ReactNode } from 'react'

export type FormulaText = {
  name: ReactNode | undefined
  formula: ReactNode
  sheet: string | undefined
  prec: number

  deps: FormulaText[]
}
