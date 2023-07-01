import type { CharacterKey } from '@genshin-optimizer/consts'
import { useContext, useEffect, useState } from 'react'
import { DatabaseContext } from '../Database/Database'

export default function useCharacter(
  characterKey: CharacterKey | '' | undefined = ''
) {
  const { database } = useContext(DatabaseContext)
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
            (k, r, v) => r === 'update' && setCharacter(v)
          )
        : undefined,
    [characterKey, setCharacter, database]
  )
  return character
}
