import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { Loadout, LoadoutMetadatum, Team } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type LoadoutContextObj = {
  teamId: string
  team: Team
  loadoutId: string
  loadout: Loadout
  loadoutMetadatum: LoadoutMetadatum
  charMap: Record<'0' | '1' | '2' | '3', CharacterKey>
}

export const LoadoutContext = createContext({} as LoadoutContextObj)

export function useLoadoutContext() {
  return useContext(LoadoutContext)
}
