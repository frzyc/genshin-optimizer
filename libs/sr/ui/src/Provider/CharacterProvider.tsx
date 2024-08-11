import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import type { CharacterContextObj } from '../Context/CharacterContext'
import { CharacterContext } from '../Context/CharacterContext'

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
