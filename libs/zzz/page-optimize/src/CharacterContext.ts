import type { ICharacter } from '@genshin-optimizer/zzz/zood'
import { createContext, useContext } from 'react'

export const CharacterContext = createContext(
  undefined as ICharacter | undefined
)

export function useCharacterContext() {
  return useContext(CharacterContext)
}
