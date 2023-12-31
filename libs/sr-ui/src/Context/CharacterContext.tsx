import type { CharacterKey } from '@genshin-optimizer/sr-consts'
import type { ReactNode } from 'react'
import { createContext, useMemo, useState } from 'react'
export type CharacterContextObj = {
  characterKey: CharacterKey | ''
  setCharacterKey: (key: CharacterKey | '') => void
}

export const CharacterContext = createContext({} as CharacterContextObj)

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [characterKey, setCharacterKey] = useState<CharacterKey | ''>('')
  const characterContextObj: CharacterContextObj = useMemo(
    () => ({ characterKey, setCharacterKey }),
    [characterKey]
  )

  return (
    <CharacterContext.Provider value={characterContextObj}>
      {children}
    </CharacterContext.Provider>
  )
}
