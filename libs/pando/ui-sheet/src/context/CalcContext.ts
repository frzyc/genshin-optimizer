//create a context for calc object
import type { Calculator } from '@genshin-optimizer/pando/engine'
import { createContext } from 'react'
// Use the Pando generic Calculator, in gi/sr specific UI, cast this calc to the gi/sr Calculator
export const CalcContext = createContext<Calculator | null>(null)
