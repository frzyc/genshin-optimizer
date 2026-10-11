import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allElementKeys,
  allTravelerKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  constant,
  equal,
  greaterEq,
  input,
  lookup,
  naught,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, condReadNode, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'ExaiphanesBlade'

const isTraveler = lookup(
  input.charKey,
  objKeyMap(allTravelerKeys, () => constant(1)),
  naught
)

const [condPassivePath, condPassive] = cond(key, 'passive')
const atk_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const critDMG_arr = [-1, 0, 0.06, 0.06, 0.06, 0.06]
const atk_ = equal(
  isTraveler,
  1,
  equal('on', condPassive, subscript(input.weapon.refinement, atk_arr))
)
// Conditional value automatically set in libs/gi/wr/src/api.ts
const numEleRes = sum(
  ...allElementKeys.map((ele) =>
    equal(condReadNode(['Traveler', `traveler${ele}`]), 'on', 1)
  )
)
const critDMG_ = equal(
  isTraveler,
  1,
  equal(
    'on',
    condPassive,
    prod(
      subscript(input.weapon.refinement, critDMG_arr, { unit: '%' }),
      numEleRes
    )
  )
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    critDMG_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      canShow: greaterEq(input.weapon.refinement, 2, isTraveler),
      fields: [
        {
          node: critDMG_,
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      canShow: isTraveler,
      name: st('hitOp.none'),
      states: {
        on: {
          fields: [
            {
              node: atk_,
            },
            {
              text: stg('duration'),
              value: 8,
              unit: 's',
            },
          ],
        },
      },
    },
  ],
}
export default new WeaponSheet(sheet, data)
