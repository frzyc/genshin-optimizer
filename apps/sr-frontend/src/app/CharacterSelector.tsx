import { CharacterContext } from '@genshin-optimizer/sr-context'
import { CharacterAutocomplete } from '@genshin-optimizer/sr-ui'
import { CardThemed } from '@genshin-optimizer/ui-common'
import { CardContent, Container } from '@mui/material'
import { useContext } from 'react'

export default function CharacterSelector() {
  const { characterKey, setCharacterKey } = useContext(CharacterContext)

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardContent>
          <CharacterAutocomplete
            charKey={characterKey}
            setCharKey={setCharacterKey}
          />
        </CardContent>
      </CardThemed>
    </Container>
  )
}
