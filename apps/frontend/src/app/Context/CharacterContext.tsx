import type { ICachedCharacter } from '@genshin-optimizer/gi/db'
import type { CharacterSheet } from '@genshin-optimizer/gi/sheets'
import { createContext } from 'react'
export type CharacterContextObj = {
  character: ICachedCharacter
  characterSheet: CharacterSheet
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const CharacterContext = createContext({} as CharacterContextObj)
