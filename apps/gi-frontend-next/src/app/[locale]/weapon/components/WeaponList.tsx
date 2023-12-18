import { useGetAllUserWeaponQuery } from '@genshin-optimizer/gi-frontend-gql'
import type { IWeapon } from '@genshin-optimizer/gi-good'
import { WeaponCard } from '@genshin-optimizer/gi-ui-next'
import { Grid } from '@mui/material'
const columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }
export default function WeaponList({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const {
    data,
    // loading, error
  } = useGetAllUserWeaponQuery({
    variables: {
      genshinUserId,
    },
  })
  return (
    <Grid container spacing={1} columns={columns}>
      {data?.getAllUserWeapon.map((weapon) => (
        <Grid item key={weapon.id} xs={1}>
          <WeaponCard weapon={weapon as IWeapon} />
        </Grid>
      ))}
    </Grid>
  )
}
