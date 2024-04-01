import { CardThemed } from '@genshin-optimizer/common/ui'
import type { ICachedSroCharacter } from '@genshin-optimizer/sr/db'
import { CardContent, Stack } from '@mui/material'

export function CharacterCard({
  character,
}: {
  character: ICachedSroCharacter
}) {
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
