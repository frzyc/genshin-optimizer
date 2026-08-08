import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'ATeaspoonOfTranscendence'

const atk_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const atk_ = subscript(input.weapon.refinement, atk_arr)

const stellar_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const [condPassivePath, condPassive] = cond(key, 'passive')
const passiveArr = range(1, 3)
const stellarconduct_dmg_ = prod(
  lookup(
    condPassive,
    objKeyMap(passiveArr, (stack) => constant(stack)),
    naught
  ),
  subscript(input.weapon.refinement, stellar_arr, { unit: '%' })
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    stellarconduct_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk_,
        },
      ],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.charged'),
      states: Object.fromEntries(
        passiveArr.map((c) => [
          c,
          {
            name: st('stack', { count: c }),
            fields: [
              {
                node: stellarconduct_dmg_,
              },
              {
                text: stg('duration'),
                value: 5,
                unit: 's',
              },
            ],
          },
        ])
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)
