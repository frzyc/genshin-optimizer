import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'Whiteblind'
const data_gen = data_gen_json as WeaponData

const [condStackPath, condStack] = cond(key, 'stack')
const bonusInc = [0.06, 0.075, 0.09, 0.105, 0.12]
const atk_ = lookup(
  condStack,
  objectKeyMap(range(1, 4), (i) =>
    prod(subscript(input.weapon.refineIndex, bonusInc, { unit: '%' }), i)
  ),
  naught
)
const def_ = lookup(
  condStack,
  objectKeyMap(range(1, 4), (i) =>
    prod(subscript(input.weapon.refineIndex, bonusInc, { unit: '%' }), i)
  ),
  naught
)

export const data = dataObjForWeaponSheet(key, data_gen, {
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
        ])
      ),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
