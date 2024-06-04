import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import {
  CharacterEditor,
  useCharacterContext,
} from '@genshin-optimizer/sr/ui'
import {
  Button,
  CardContent,
  Container,
  Stack,
} from '@mui/material'
import { useState } from 'react'
import CharacterSelector from './CharacterSelector'
import Database from './Database'
import Optimize from './Optimize'

// TODO: Move this to a lib once the components below are moved.
export default function PageHome() {
  const { characterKey } = useCharacterContext()
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )
  return (
    <>
      <CharacterEditor
        characterKey={editorKey}
        onClose={() => setCharacterKey(undefined)}
      />
      <Stack gap={1} pt={1}>
        <Container>
          <CardThemed bgt="dark">
            <CardContent>
              <CharacterSelector />
              <Button
                disabled={!characterKey}
                onClick={() => characterKey && setCharacterKey(characterKey)}
              >
                Edit Character
              </Button>
            </CardContent>
          </CardThemed>
        </Container>
        <Optimize />
        <Database />
      </Stack>
    </>
  )
}
