import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
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

const key: WeaponKey = 'IronSting'

const [condPassivePath, condPassive] = cond(key, 'InfusionStinger')
const eleDmgDealtStack = range(1, 2)
const allDmgInc = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const all_dmg_ = prod(
  lookup(
    condPassive,
    objKeyMap(eleDmgDealtStack, (i) => constant(i)),
    naught,
  ),
  subscript(input.weapon.refinement, allDmgInc),
)

const data = dataObjForWeaponSheet(key, {
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
        ]),
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)
