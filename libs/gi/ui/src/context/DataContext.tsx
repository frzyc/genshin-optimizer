import type { UIData } from '@genshin-optimizer/gi/uidata'
import { createContext } from 'react'
import type { TeamData } from '../type/TeamData'

export type dataContextObj = {
  data: UIData
  compareData?: UIData
  teamData: TeamData
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const DataContext = createContext({} as dataContextObj)
