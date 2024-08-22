import type { ICachedSroCharacter } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type CharacterContextObj = {
  character: ICachedSroCharacter | undefined
}

export const CharacterContext = createContext({} as CharacterContextObj)

export function useCharacterContext() {
  return useContext(CharacterContext)
}
