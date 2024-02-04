import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
type CharacterContextObj = {
  characterKey: CharacterKey | ''
  setCharacterKey: (key: CharacterKey | '') => void
}

const CharacterContext = createContext({} as CharacterContextObj)

export function useCharacterContext() {
  return useContext(CharacterContext)
}

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
