import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'PrototypeStarglitter'
const data_gen = allStats.weapon.data[key]

const [condStackPath, condStack] = cond(key, 'stack')
const dmgInc = [0.08, 0.1, 0.12, 0.14, 0.16]
const normal_dmg_ = lookup(
  condStack,
  objKeyMap(range(1, 2), (i) =>
    prod(subscript(input.weapon.refineIndex, dmgInc, { unit: '%' }), i)
  ),
  naught
)
const charged_dmg_ = lookup(
  condStack,
  objKeyMap(range(1, 2), (i) =>
    prod(subscript(input.weapon.refineIndex, dmgInc, { unit: '%' }), i)
  ),
  naught
)
export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_,
    charged_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condStack,
      path: condStackPath,
      header: headerTemplate(key, st('stacks')),
      name: st('afterUse.skill'),
      states: Object.fromEntries(
        range(1, 2).map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [{ node: normal_dmg_ }, { node: charged_dmg_ }],
          },
        ])
      ),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
