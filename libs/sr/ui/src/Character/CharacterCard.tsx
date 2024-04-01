import { CardThemed } from '@genshin-optimizer/common/ui'
import type { ICachedSroCharacter } from '@genshin-optimizer/sr/db'
import { CardContent, Stack } from '@mui/material'

export function CharacterCard({
  character,
}: {
  character: ICachedSroCharacter
}) {
  if (!character) {
    console.error(
      'NO CHARACTER'
    ) /* we should prevent rendering this in the calling component */
    return <div />
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
