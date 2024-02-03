import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  CharacterAutocomplete,
  useCharacterContext,
} from '@genshin-optimizer/sr/ui'
import { CardContent, Container } from '@mui/material'

export default function CharacterSelector() {
  const { characterKey, setCharacterKey } = useCharacterContext()

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
