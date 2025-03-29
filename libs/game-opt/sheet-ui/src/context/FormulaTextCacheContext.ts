import type { CalcMeta, Tag } from '@genshin-optimizer/game-opt/engine'
import type { CalcResult } from '@genshin-optimizer/pando/engine'
import { createContext } from 'react'
import type { FormulaText } from '../types'

export const FormulaTextCacheContext = createContext<
  Map<CalcResult<number, CalcMeta<Tag, never>>, FormulaText>
>(new Map())
