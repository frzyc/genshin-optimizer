import type { Artifact } from '@genshin-optimizer/gi-frontend-gql'
import {
  GetAllUserArtifactDocument,
  useUpdateArtifactMutation,
} from '@genshin-optimizer/gi-frontend-gql'
import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'
import { useContext } from 'react'
import { UserContext } from '../UserDataWrapper'
import { updateArtifactList } from '../gqlUtil'

type Prop = {
  artifact?: Artifact
  afterUpdate?: () => void
} & ButtonProps
export function UpdateArtifactButton({
  artifact,
  children,
  disabled,
  onClick,
  afterUpdate,
  ...props
}: Prop) {
  const { genshinUserId } = useContext(UserContext)
  const [updateArtifactMutation, { loading, error }] =
    useUpdateArtifactMutation({
      variables: {
        genshinUserId,
        artifact: artifact as Artifact,
      },
      update(cache, { data }) {
        const art = data?.updateArtifact
        if (!art) return
        cache.updateQuery(
          {
            query: GetAllUserArtifactDocument,
            variables: {
              genshinUserId,
            },
          },
          ({ getAllUserArtifact }) => ({
            getAllUserArtifact: updateArtifactList(getAllUserArtifact, art),
          })
        )
        afterUpdate?.()
      },
    })
  if (error) console.error(error)
  return (
    <Button
      {...props}
      disabled={disabled || loading || !artifact}
      onClick={(e) => {
        if (!genshinUserId || !artifact) return
        updateArtifactMutation()
        onClick?.(e)
      }}
    >
      {children}
    </Button>
  )
}
