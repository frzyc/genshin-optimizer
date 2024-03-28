import { CardThemed } from '@genshin-optimizer/common/ui'
import { CardContent, Stack, Typography } from '@mui/material'
import { ICachedSroCharacter } from '@genshin-optimizer/sr/db'

export function CharacterCard({ character }: { character: ICachedSroCharacter }) {
  if (!character) {
    console.log("NO CHARACTER");
    return (
      <Stack>
        <CardThemed>
          <CardContent>
          </CardContent>
        </CardThemed>
      </Stack>
    );
  }

  return (
    <Stack>
      <CardThemed>
        <CardContent>
          <div>key: {character.key}</div>
          <div>eidolon: {character.eidolon}</div>
          <div>level: {character.level}</div>
        </CardContent>
      </CardThemed>
    </Stack>
  )
}
