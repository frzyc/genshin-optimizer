import {
  GetAllUserArtifactDocument,
  useAddArtifactMutation,
} from '@genshin-optimizer/gi-frontend-gql'
import { randomizeArtifact } from '@genshin-optimizer/gi-good'
import { Button } from '@mui/material'

export default function AddArtButton({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const [addArtifactMutation, { data, loading, error }] =
    useAddArtifactMutation({
      variables: {
        genshinUserId,
        artifact: randomizeArtifact(),
      },
      update(cache, { data }) {
        if (!data?.addArtifact.success) return
        const art = data.addArtifact.artifact
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
  console.log({ data, loading, error })
  return (
    <Button onClick={() => addArtifactMutation()}>Add random Artifact</Button>
  )
}
