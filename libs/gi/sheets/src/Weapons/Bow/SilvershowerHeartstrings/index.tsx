import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  lookup,
  naught,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SilvershowerHeartstrings'
const [, trm] = trans('weapon', key)

const stackHp_arrs = [
  [-1, 0.12, 0.15, 0.18, 0.21, 0.24],
  [-1, 0.24, 0.3, 0.36, 0.42, 0.48],
  [-1, 0.4, 0.5, 0.6, 0.7, 0.8],
]
const burst_critRate_arr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]

const blessingStacksArr = range(1, 3)
const [condBlessingStacksPath, condBlessingStacks] = cond(key, 'blessingStacks')
const hp_ = lookup(
  condBlessingStacks,
  objKeyMap(blessingStacksArr, (stack) =>
    subscript(input.weapon.refinement, stackHp_arrs[stack - 1]),
  ),
  naught,
)

const burst_critRate_ = equal(
  condBlessingStacks,
  '3',
  subscript(input.weapon.refinement, burst_critRate_arr),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    hp_,
    burst_critRate_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('stacks')),
      path: condBlessingStacksPath,
      value: condBlessingStacks,
      name: trm('cond'),
      states: objKeyMap(blessingStacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: hp_,
          },
          {
            node: burst_critRate_,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
