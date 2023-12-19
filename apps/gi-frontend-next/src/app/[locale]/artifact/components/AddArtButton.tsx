import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import {
  GetAllUserArtifactDocument,
  useAddArtifactMutation,
} from '@genshin-optimizer/gi-frontend-gql'
import { IArtifactToArtifact, UserContext } from '@genshin-optimizer/gi-ui-next'
import { randomizeArtifact } from '@genshin-optimizer/gi-util'
import { getRandomElementFromArray } from '@genshin-optimizer/util'
import { Button } from '@mui/material'
import { useContext } from 'react'

export default function AddArtButton() {
  const { genshinUserId } = useContext(UserContext)
  const [
    addArtifactMutation,
    //{ data, loading, error }
  ] = useAddArtifactMutation({
    variables: {
      genshinUserId,
      artifact: IArtifactToArtifact(
        randomizeArtifact({
          slotKey: 'goblet',
          // Only a small subset of artifacts have been added to gi-formula
          setKey: getRandomElementFromArray([
            'NoblesseOblige',
          ] as ArtifactSetKey[]),
        })
      ),
    },
    update(cache, { data }) {
      const art = data?.addArtifact
      if (!art) return
      cache.updateQuery(
        {
          query: GetAllUserArtifactDocument,
          variables: {
            genshinUserId,
          },
        },
        ({ getAllUserArtifact }) => {
          return {
            getAllUserArtifact: [...getAllUserArtifact, art],
          }
        }
      )
    },
  })
  return (
    <Button onClick={() => addArtifactMutation()}>Add random Artifact</Button>
  )
}
