import type { CharacterKey } from '@genshin-optimizer/consts'
import type { Character } from '@genshin-optimizer/gi-frontend-gql'
import {
  GetAllUserCharacterDocument,
  useAddCharacterMutation,
} from '@genshin-optimizer/gi-frontend-gql'
import { randomizeCharacter } from '@genshin-optimizer/gi-util'
import { getRandomElementFromArray } from '@genshin-optimizer/util'
import { Button } from '@mui/material'

export default function AddCharacterButton({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const [
    addCharacterMutation,
    // { data, loading, error }
  ] = useAddCharacterMutation({
    variables: {
      genshinUserId,
      character: randomizeCharacter({
        // Only a small subset of characters have been added to gi-formula
        key: getRandomElementFromArray([
          'Candace',
          'Nahida',
          'Nilou',
        ] as CharacterKey[]),
      }),
    },
    update(cache, { data }) {
      const char = data?.addCharacter
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
