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

const key: WeaponKey = 'PrototypeStarglitter'

const [condStackPath, condStack] = cond(key, 'stack')
const dmgInc = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const normal_dmg_ = lookup(
  condStack,
  objKeyMap(range(1, 2), (i) =>
    prod(subscript(input.weapon.refinement, dmgInc, { unit: '%' }), i),
  ),
  naught,
)
const charged_dmg_ = lookup(
  condStack,
  objKeyMap(range(1, 2), (i) =>
    prod(subscript(input.weapon.refinement, dmgInc, { unit: '%' }), i),
  ),
  naught,
)
export const data = dataObjForWeaponSheet(key, {
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
        ]),
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)
