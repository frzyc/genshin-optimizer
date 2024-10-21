import type { ICachedCharacter } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

// TODO: no need to wrap this in an object
export type CharacterContextObj = {
  character: ICachedCharacter | undefined
}

export const CharacterContext = createContext({} as CharacterContextObj)

export function useCharacterContext() {
  return useContext(CharacterContext)
}
