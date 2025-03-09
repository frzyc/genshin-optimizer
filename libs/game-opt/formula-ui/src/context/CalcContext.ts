// create a context for calc object
import type { Calculator, Tag } from '@genshin-optimizer/game-opt/engine'
import { createContext } from 'react'
// Use the game-opt generic Calculator.
// In game-specific UI, cast this calc to the game's Calculator
export const CalcContext = createContext<Calculator<Tag, 'floor'> | null>(null)
