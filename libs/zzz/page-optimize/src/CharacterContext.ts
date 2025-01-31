import type { CharacterData } from '@genshin-optimizer/zzz/db'
import { createContext, useContext } from 'react'

export const CharacterContext = createContext(
  undefined as CharacterData | undefined
)

export function useCharacterContext() {
  return useContext(CharacterContext)
}
