import type { Artifact } from '@genshin-optimizer/gi/frontend-gql'
import {
  GetAllUserArtifactDocument,
  useAddArtifactMutation,
} from '@genshin-optimizer/gi/frontend-gql'
import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'
import { UserContext } from '../UserDataWrapper'
import { useContext } from 'react'

type Prop = {
  artifact?: Artifact
  afterAdd?: () => void
} & ButtonProps
export function AddArtifactButton({
  artifact,
  children,
  disabled,
  onClick,
  afterAdd,
  ...props
}: Prop) {
  const { genshinUserId } = useContext(UserContext)
  const [addArtifactMutation, { loading, error }] = useAddArtifactMutation({
    variables: {
      genshinUserId,
      artifact: artifact as Artifact,
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
      afterAdd?.()
    },
  })
  if (error) console.error(error)
  return (
    <Button
      {...props}
      disabled={disabled || loading || !artifact}
      onClick={(e) => {
        if (!genshinUserId || !artifact) return
        addArtifactMutation()
        onClick?.(e)
      }}
    >
      {children}
    </Button>
  )
}
