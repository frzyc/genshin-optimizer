import type { CalcMeta, Tag } from '@genshin-optimizer/game-opt/engine'
import type { CalcResult } from '@genshin-optimizer/pando/engine'
import { createContext } from 'react'
import type { FormulaText } from '../types'

export type FormulaTextFunc = (
  _data: CalcResult<number, CalcMeta<Tag, never>>,
  _cache: Map<CalcResult<number, CalcMeta<Tag, never>>, FormulaText>
) => FormulaText

export const FormulaTextContext = createContext<FormulaTextFunc>(() => ({
  name: undefined,
  formula: undefined,
  sheet: undefined,
  prec: 0,
  deps: [],
}))
