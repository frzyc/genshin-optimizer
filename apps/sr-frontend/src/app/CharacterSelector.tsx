import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import {
  CharacterAutocomplete,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/ui'
import { useCallback } from 'react'

export default function CharacterSelector() {
  const { characterKey, setCharacterKey } = useCharacterContext()
  const { database } = useDatabaseContext()

  const setOrCreateCharacter = useCallback(
    (charKey: CharacterKey | '') => {
      if (charKey) database.chars.getOrCreate(charKey)
      setCharacterKey(charKey)
    },
    [database.chars, setCharacterKey]
  )

  return (
    <CharacterAutocomplete
      charKey={characterKey}
      setCharKey={setOrCreateCharacter}
    />
  )
}
