import type { TeammateDatum } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export const TeammateContext = createContext({
  buildType: 'equipped',
  buildId: '',
} as TeammateDatum)

export function useTeammateContext() {
  return useContext(TeammateContext)
}
