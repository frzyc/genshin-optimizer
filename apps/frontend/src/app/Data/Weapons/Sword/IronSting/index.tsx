import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import {
  constant,
  lookup,
  naught,
  prod,
  subscript,
} from '../../../../Formula/utils'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'IronSting'
const data_gen = allStats.weapon.data[key]

const [condPassivePath, condPassive] = cond(key, 'InfusionStinger')
const eleDmgDealtStack = range(1, 2)
const allDmgInc = [0.06, 0.075, 0.09, 0.105, 0.12]
const all_dmg_ = prod(
  lookup(
    condPassive,
    objKeyMap(eleDmgDealtStack, (i) => constant(i)),
    naught
  ),
  subscript(input.weapon.refineIndex, allDmgInc)
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.ele'),
      states: Object.fromEntries(
        eleDmgDealtStack.map((c) => [
          c,
          {
            name: st('stack', { count: c }),
            fields: [
              {
                node: all_dmg_,
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
