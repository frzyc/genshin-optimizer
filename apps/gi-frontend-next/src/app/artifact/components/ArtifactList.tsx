import { useGetAllUserArtifactQuery } from '@genshin-optimizer/gi-frontend-gql'
import { Stack, Typography } from '@mui/material'

export default function ArtifactList({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const { data, loading, error } = useGetAllUserArtifactQuery({
    variables: {
      genshinUserId,
    },
  })
  console.log({ data, loading, error })
  return (
    <Stack>
      {data?.getAllUserArtifact.map(({ id }) => (
        <Typography key={id}>{id}</Typography>
      ))}
    </Stack>
  )
}
