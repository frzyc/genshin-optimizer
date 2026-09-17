import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import {
  allStellarReactionKeys,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { equal, input, lookup, prod, subscript } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'WhitelakeFrostfeather'

const [condPassivePath, condPassive] = cond(key, 'passive')
const passiveRange = range(1, 3)
const atk_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const atk_ = lookup(
  condPassive,
  objKeyMap(passiveRange, (i) =>
    prod(i, subscript(input.weapon.refinement, atk_arr, { unit: '%' }))
  ),
  0
)
const stellar_critDMG_arr = [-1, 0.5, 0.65, 0.8, 0.95, 1.1]
const stellar_critDMG_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_critDMG_`,
  equal(
    condPassive,
    '3',
    subscript(input.weapon.refinement, stellar_critDMG_arr)
  ),
])

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: atk_,
    ...stellar_critDMG_obj,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('stacks'),
      states: objKeyMap(passiveRange, (stack) => ({
        name: `${stack}`,
        fields: [
          {
            node: atk_,
          },
          ...Object.values(stellar_critDMG_obj).map((node) => ({ node })),
          {
            text: stg('duration'),
            value: 8,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: 0.1,
            unit: 's',
            fixed: 1,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
