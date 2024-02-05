import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'RoyalBow'
const data_gen = allStats.weapon.data[key]

const critRate_s = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const [condPassivePath, condPassive] = cond(key, 'Focus')
const critRate_ = lookup(
  condPassive,
  {
    ...objKeyMap(range(1, 5), (i) =>
      prod(subscript(input.weapon.refinement, critRate_s), i)
    ),
  },
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critRate_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('stacks'),
      states: Object.fromEntries(
        range(1, 5).map((i) => [
          i,
          {
            name: st('stack', { count: i }),
            fields: [
              {
                node: critRate_,
              },
            ],
          },
        ])
      ),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
