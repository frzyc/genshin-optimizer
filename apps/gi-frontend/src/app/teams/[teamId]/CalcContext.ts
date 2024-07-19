//create a context for calc object
import type { Calculator } from '@genshin-optimizer/gi/formula'
import { createContext } from 'react'

export const CalcContext = createContext<Calculator | null>(null)
