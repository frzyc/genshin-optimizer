import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import {
  CharacterAutocomplete,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/ui'
import { CardContent, Container } from '@mui/material'
import { useCallback } from 'react'

export default function CharacterSelector() {
  const { characterKey, setCharacterKey } = useCharacterContext()
  const { database } = useDatabaseContext()

  const setOrCreateCharacter = useCallback(
    (charKey: CharacterKey | '') => {
      if (!charKey) return
      database.chars.getOrCreate(charKey)
      setCharacterKey(charKey)
    },
    [database.chars, setCharacterKey]
  )

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardContent>
          <CharacterAutocomplete
            charKey={characterKey}
            setCharKey={setOrCreateCharacter}
          />
        </CardContent>
      </CardThemed>
    </Container>
  )
}
