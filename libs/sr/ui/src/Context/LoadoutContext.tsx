import type { Loadout, LoadoutMetadatum, Team } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type LoadoutContextObj = {
  teamId: string
  team: Team
  loadoutId: string
  loadout: Loadout
  loadoutMetadatum: LoadoutMetadatum
}

export const LoadoutContext = createContext({} as LoadoutContextObj)

export function useLoadoutContext() {
  return useContext(LoadoutContext)
}
