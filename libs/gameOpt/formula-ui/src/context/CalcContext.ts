// create a context for calc object
import type { Calculator } from '@genshin-optimizer/gameOpt/engine'
import { createContext } from 'react'
// Use the GameOpt generic Calculator.
// In game-specific UI, cast this calc to the game's Calculator
export const CalcContext = createContext<Calculator<
  string | null,
  string | null,
  string,
  string
> | null>(null)
