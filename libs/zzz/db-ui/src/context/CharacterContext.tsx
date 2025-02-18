'use client'
import type { ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { createContext } from 'react'
export type CharacterContextObj = {
  character: ICachedCharacter
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const CharacterContext = createContext({} as CharacterContextObj)
