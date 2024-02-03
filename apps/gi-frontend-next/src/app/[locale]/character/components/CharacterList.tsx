import type { Character } from '@genshin-optimizer/gi_frontend-gql'
import { useGetAllUserCharacterQuery } from '@genshin-optimizer/gi_frontend-gql'
import { CharacterCard } from '@genshin-optimizer/gi_ui-next'
import { Box, Grid, Skeleton } from '@mui/material'

const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }
export default function CharacterList({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const { data, loading, error } = useGetAllUserCharacterQuery({
    variables: {
      genshinUserId,
    },
  })
  if (error) console.error(error)
  if (loading) return <Skeleton width="100%" height={600} />
  return (
    <Box>
      <Grid container spacing={1} columns={columns}>
        {data?.getAllUserCharacter.map((character) => (
          <Grid item key={character.id} xs={1}>
            <CharacterCard character={character as Character} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
