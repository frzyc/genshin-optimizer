import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
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

const key: WeaponKey = 'PrimordialJadeWingedSpear'

const [condStackPath, condStack] = cond(key, 'stack')
const atkInc = [-1, 0.032, 0.039, 0.046, 0.053, 0.06]
const allDmgInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = lookup(
  condStack,
  objKeyMap(range(1, 7), (i) =>
    prod(subscript(input.weapon.refinement, atkInc, { unit: '%' }), i),
  ),
  naught,
)
const all_dmg_ = equal(
  condStack,
  '7',
  subscript(input.weapon.refinement, allDmgInc, { unit: '%' }),
)
export const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    all_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condStack,
      path: condStackPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.none'),
      states: Object.fromEntries(
        range(1, 7).map((i) => [
          i,
          {
            name: st('hits', { count: i }),
            fields: [{ node: atk_ }, { node: all_dmg_ }],
          },
        ]),
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)
