import {
  CardThemed,
  DropdownButton,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import type { AscensionKey, CharacterKey } from '@genshin-optimizer/sr/consts'
import { allEidolonKeys } from '@genshin-optimizer/sr/consts'
import {
  CardContent,
  Grid,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import { Suspense } from 'react'
import { useDatabaseContext } from '../Context'
import { useCharacter } from '../Hook'

export function CharacterEditor({
  characterKey,
  onClose,
}: {
  characterKey: CharacterKey | undefined
  onClose: () => void
}) {
  return (
    <ModalWrapper open={!!characterKey} onClose={onClose}>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
      >
        {characterKey && <CharacterEditorContent characterKey={characterKey} />}
      </Suspense>
    </ModalWrapper>
  )
}

function CharacterEditorContent({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const character = useCharacter(characterKey)
  const { database } = useDatabaseContext()

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h2">{characterKey}</Typography>
        <TextField
          type="number"
          label="Level"
          variant="outlined"
          inputProps={{ min: 1, max: 90 }}
          value={character?.level || 0}
          onChange={(e) =>
            database.chars.set(characterKey, {
              level: parseInt(e.target.value),
            })
          }
          disabled={!character}
        />
        <TextField
          type="number"
          label="Ascension"
          variant="outlined"
          inputProps={{ min: 0, max: 6 }}
          value={character?.ascension || 0}
          onChange={(e) =>
            database.chars.set(characterKey, {
              ascension: parseInt(e.target.value) as AscensionKey,
            })
          }
          disabled={!character}
        />
        <Grid container>
          <Grid item>
            <DropdownButton
              title={`Eidolon Lv. ${character?.eidolon ?? 0}`}
              fullWidth={false}
              disabled={!character}
            >
              {allEidolonKeys.map((eidolon) => (
                <MenuItem
                  key={eidolon}
                  selected={character?.eidolon === eidolon}
                  disabled={character?.eidolon === eidolon}
                  onClick={() => database.chars.set(characterKey, { eidolon })}
                >
                  Eidolon Lv. {eidolon}
                </MenuItem>
              ))}
            </DropdownButton>
          </Grid>
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
