import type { Loadout, LoadoutMetadatum, Team } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type LoadoutContextObj = {
  teamId: string
  team: Team
  loadoutId: string
  loadout: Loadout
  loadoutMetadatum: LoadoutMetadatum
}
/**
 * @deprecated move to page-team
 */
export const LoadoutContext = createContext({} as LoadoutContextObj)
/**
 * @deprecated move to page-team
 */
export function useLoadoutContext() {
  return useContext(LoadoutContext)
}
