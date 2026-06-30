import type { CalcMeta, Tag } from '@genshin-optimizer/game-opt-engine'
import type { CalcResult } from '@genshin-optimizer/pando-engine'
import { createContext } from 'react'
import type { FormulaText } from '../types'

/**
 * Memo map for `formulaText()` while building a help tooltip.
 * Shared per calculator (see CharCalcProvider) so repeated `CalcResult` nodes
 * in one tree are not re-rendered, and so multiple FormulaHelpIcons reuse work.
 * Cleared when `calc` changes so tooltips stay in sync with equipment/opt.
 */
export const FormulaTextCacheContext = createContext<
  Map<CalcResult<number, CalcMeta<Tag, never>>, FormulaText>
>(new Map())
