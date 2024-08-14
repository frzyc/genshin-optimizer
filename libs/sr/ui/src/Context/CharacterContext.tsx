import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { createContext, useContext } from 'react'

export type CharacterContextObj = {
  characterKey: CharacterKey | ''
  setCharacterKey: (key: CharacterKey | '') => void
}

export const CharacterContext = createContext({} as CharacterContextObj)

export function useCharacterContext() {
  return useContext(CharacterContext)
}
