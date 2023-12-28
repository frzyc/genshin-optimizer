import type { WeaponKey } from '@genshin-optimizer/consts'
import {
  GetAllUserWeaponDocument,
  useAddWeaponMutation,
} from '@genshin-optimizer/gi-frontend-gql'
import { randomizeWeapon } from '@genshin-optimizer/gi-util'
import { getRandomElementFromArray } from '@genshin-optimizer/util'
import { Button } from '@mui/material'

export default function AddWeaponButton({
  genshinUserId,
}: {
  genshinUserId: string
}) {
  const [
    addWeaponMutation,
    // { data, loading, error }
  ] = useAddWeaponMutation({
    variables: {
      genshinUserId,
      weapon: randomizeWeapon({
        // Only a small subset of weapons have been added to gi-formula
        key: getRandomElementFromArray([
          'CalamityQueller',
          'KeyOfKhajNisut',
          'PrototypeAmber',
          'TulaytullahsRemembrance',
        ] as WeaponKey[]),
      }),
    },
    update(cache, { data }) {
      if (!data?.addWeapon) return
      const weap = data.addWeapon
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
