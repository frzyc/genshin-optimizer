import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'RoyalSpear'

const [condStackPath, condStack] = cond(key, 'stack')
const crit_ = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const critRate_ = lookup(
  condStack,
  objKeyMap(range(1, 5), (i) =>
    prod(subscript(input.weapon.refinement, crit_, { unit: '%' }), i),
  ),
  naught,
)
export const data = dataObjForWeaponSheet(key, {
  premod: {
    critRate_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condStack,
      path: condStackPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: st('stacks'),
      states: Object.fromEntries(
        range(1, 5).map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [{ node: critRate_ }],
          },
        ]),
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)
