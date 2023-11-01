import { useGetAllUserCharacterQuery } from '@genshin-optimizer/gi-frontend-gql'
import { Grid } from '@mui/material'

const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
export default function WeaponList({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const { data, loading, error } = useGetAllUserCharacterQuery({
    variables: {
      genshinUserId,
    },
  })
  return (
    <Grid container spacing={1} columns={columns}>
      {data?.getAllUserCharacter.map((character) => (
        <Grid item key={character.id} xs={1}>
          {JSON.stringify(character)}
          {/* <CharacterCard character={character as ICharacter} /> */}
        </Grid>
      ))}
    </Grid>
  )
}
