import {
  GetAllUserWeaponDocument,
  useAddWeaponMutation
} from '@genshin-optimizer/gi-frontend-gql'
import { randomizeWeapon } from '@genshin-optimizer/gi-util'
import { Button } from '@mui/material'

export default function AddWeaponButton({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const [addWeaponMutation, { data, loading, error }] = useAddWeaponMutation({
    variables: {
      genshinUserId,
      weapon: randomizeWeapon(),
    },
    update(cache, { data }) {
      if (!data?.addWeapon.success) return
      const weap = data.addWeapon.weapon
      if (!weap) return
      cache.updateQuery(
        {
          query: GetAllUserWeaponDocument,
          variables: {
            genshinUserId,
          },
        },
        ({ getAllUserWeapon }) => {
          return {
            getAllUserWeapon: [...getAllUserWeapon, weap],
          }
        }
      )
    },
  })
  return <Button onClick={() => addWeaponMutation()}>Add random Weapon</Button>
}
