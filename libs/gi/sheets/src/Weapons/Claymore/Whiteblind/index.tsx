import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Whiteblind'

const [condStackPath, condStack] = cond(key, 'stack')
const bonusInc = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const atk_ = lookup(
  condStack,
  objKeyMap(range(1, 4), (i) =>
    prod(subscript(input.weapon.refinement, bonusInc, { unit: '%' }), i),
  ),
  naught,
)
const def_ = lookup(
  condStack,
  objKeyMap(range(1, 4), (i) =>
    prod(subscript(input.weapon.refinement, bonusInc, { unit: '%' }), i),
  ),
  naught,
)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    def_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condStack,
      path: condStackPath,
      name: st('hitOp.normalOrCharged'),
      header: headerTemplate(key, st('stacks')),
      states: Object.fromEntries(
        range(1, 4).map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [
              {
                node: atk_,
              },
              {
                node: def_,
              },
              {
                text: stg('duration'),
                value: 6,
                unit: 's',
              },
            ],
          },
        ]),
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)
