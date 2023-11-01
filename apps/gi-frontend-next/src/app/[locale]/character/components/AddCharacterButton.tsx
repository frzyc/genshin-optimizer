import type {
  Character
} from '@genshin-optimizer/gi-frontend-gql';
import {
  GetAllUserCharacterDocument,
  useAddCharacterMutation
} from '@genshin-optimizer/gi-frontend-gql';
import {
  randomizeCharacter
} from '@genshin-optimizer/gi-util';
import { Button } from '@mui/material';

export default function AddCharacterButton({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const [addCharacterMutation, { data, loading, error }] =
    useAddCharacterMutation({
      variables: {
        genshinUserId,
        character: randomizeCharacter(),
      },
      update(cache, { data }) {
        if (!data?.addCharacter.success) return
        const char = data?.addCharacter.character
        if (!char) return
        cache.updateQuery(
          {
            query: GetAllUserCharacterDocument,
            variables: {
              genshinUserId,
            },
          },
          ({ getAllUserCharacter }) => {
            const charIndex = (getAllUserCharacter as Character[]).findIndex(
              (c) => c.key === char.key
            )
            if (charIndex === -1)
              return {
                getAllUserCharacter: [...getAllUserCharacter, char],
              }
            return {
              getAllUserCharacter: (getAllUserCharacter as Character[]).map(
                (c, i) => (i === charIndex ? char : c)
              ),
            }
          }
        )
      },
    })

  return (
    <Button onClick={() => addCharacterMutation()}>Add random Character</Button>
  )
}
