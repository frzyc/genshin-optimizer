import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  input,
  lookup,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SacrificersStaff'

const [condPassivePath, condPassive] = cond(key, 'passive')
const skillHits = range(1, 3)
const atk_arr = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const atk_ = prod(
  lookup(
    condPassive,
    objKeyMap(skillHits, (i) => constant(i)),
    0
  ),
  subscript(input.weapon.refinement, atk_arr)
)
const enerRech_arr = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const enerRech_ = prod(
  lookup(
    condPassive,
    objKeyMap(skillHits, (i) => constant(i)),
    0
  ),
  subscript(input.weapon.refinement, enerRech_arr)
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    enerRech_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.skill'),
      states: Object.fromEntries(
        skillHits.map((c) => [
          c,
          {
            name: st('stack', { count: c }),
            fields: [
              {
                node: atk_,
              },
              {
                node: enerRech_,
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
export default new WeaponSheet(sheet, data)
