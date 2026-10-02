import { objKeyValMap } from '@genshin-optimizer/common/util'
import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  equal,
  infoMut,
  input,
  prod,
  subscript,
  sum,
  tally,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'WintersHeavyHeart'

const normal_eleMasArr = [-1, 24, 30, 36, 42, 48]
const atk_arr = [-1, 0.048, 0.06, 0.072, 0.084, 0.096]
const stellar_eleMasArr = [-1, 20, 25, 30, 35, 40]
const stellar_dmg_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]

const normal_eleMas = equal(
  input.weapon.key,
  key,
  equal(
    input.flags.radiance,
    undefined,
    prod(tally.cryo, subscript(input.weapon.refinement, normal_eleMasArr))
  )
)
const atk_ = equal(
  input.weapon.key,
  key,
  equal(
    input.flags.radiance,
    undefined,
    prod(
      tally.electro,
      subscript(input.weapon.refinement, atk_arr, { unit: '%' })
    )
  )
)
const stellar_eleMas = equal(
  input.weapon.key,
  key,
  unequal(
    input.flags.radiance,
    undefined,
    prod(
      sum(tally.cryo, tally.electro),
      subscript(input.weapon.refinement, stellar_eleMasArr)
    )
  )
)
const stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_dmg_`,
  equal(
    input.weapon.key,
    key,
    unequal(
      input.flags.radiance,
      undefined,
      prod(
        sum(tally.cryo, tally.electro),
        subscript(input.weapon.refinement, stellar_dmg_arr, { unit: '%' })
      )
    )
  ),
])

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas: sum(normal_eleMas, stellar_eleMas),
    atk_,
    ...stellar_dmg_obj,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: infoMut(normal_eleMas, { path: 'eleMas' }),
        },
        {
          node: atk_,
        },
        {
          node: infoMut(stellar_eleMas, { path: 'eleMas' }),
        },
        ...Object.values(stellar_dmg_obj).map((node) => ({ node })),
      ],
    },
  ],
}

export default new WeaponSheet(sheet, data)
