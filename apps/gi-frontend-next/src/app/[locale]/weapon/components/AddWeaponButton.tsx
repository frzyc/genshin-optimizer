import { getRandomElementFromArray } from '@genshin-optimizer/common_util'
import type { WeaponKey } from '@genshin-optimizer/gi_consts'
import {
  GetAllUserWeaponDocument,
  useAddWeaponMutation,
} from '@genshin-optimizer/gi_frontend-gql'
import { randomizeWeapon } from '@genshin-optimizer/gi_util'
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
      weapon: {
        ...randomizeWeapon({
          // Only a small subset of weapons have been added to gi_formula
          key: getRandomElementFromArray([
            'CalamityQueller',
            'KeyOfKhajNisut',
            'PrototypeAmber',
            'TulaytullahsRemembrance',
          ] as WeaponKey[]),
        }),
        location: null,
      },
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
