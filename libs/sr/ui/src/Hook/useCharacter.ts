import type { CharacterKey } from '@genshin-optimizer/sr_consts'
import { useEffect, useState } from 'react'
import { useDatabaseContext } from '../Context'

export function useCharacter(characterKey: CharacterKey | '' | undefined = '') {
  const { database } = useDatabaseContext()
  const [character, setCharacter] = useState(database.chars.get(characterKey))
  useEffect(
    () => setCharacter(database.chars.get(characterKey)),
    [database, characterKey]
  )
  useEffect(
    () =>
      characterKey
        ? database.chars.follow(
            characterKey,
            (_k, r, v) => r === 'update' && setCharacter(v)
          )
        : undefined,
    [characterKey, setCharacter, database]
  )
  return character
}
