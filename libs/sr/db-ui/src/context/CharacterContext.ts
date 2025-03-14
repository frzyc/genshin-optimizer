import type { ICachedCharacter } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export const CharacterContext = createContext(
  undefined as ICachedCharacter | undefined,
)

export function useCharacterContext() {
  return useContext(CharacterContext)
}
