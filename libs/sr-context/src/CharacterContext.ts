import type { CharacterKey } from '@genshin-optimizer/sr-consts'
import { createContext } from 'react'
export type CharacterContextObj = {
  characterKey: CharacterKey | ''
  setCharacterKey: (key: CharacterKey | '') => void
}

export const CharacterContext = createContext({} as CharacterContextObj)
