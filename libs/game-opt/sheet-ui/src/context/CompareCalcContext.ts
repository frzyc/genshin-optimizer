import type { Calculator } from '@genshin-optimizer/game-opt/engine'
import { createContext } from 'react'

/** Optional calculator for base/equipped build comparison in field rows. */
export const CompareCalcContext = createContext<Calculator | null>(null)
