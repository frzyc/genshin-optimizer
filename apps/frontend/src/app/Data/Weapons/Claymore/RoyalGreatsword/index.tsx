import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'RoyalGreatsword'
const data_gen = allStats.weapon.data[key]

const [condStackPath, condStack] = cond(key, 'stack')
const crit_ = [0.08, 0.1, 0.12, 0.14, 0.16]
const critRate_ = lookup(
  condStack,
  objectKeyMap(range(1, 5), (i) =>
    prod(subscript(input.weapon.refineIndex, crit_, { unit: '%' }), i)
  ),
  naught
)

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critRate_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condStack,
      path: condStackPath,
      name: st('opponentsDamaged'),
      header: headerTemplate(key, st('stacks')),
      states: Object.fromEntries(
        range(1, 5).map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [{ node: critRate_ }],
          },
        ])
      ),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
