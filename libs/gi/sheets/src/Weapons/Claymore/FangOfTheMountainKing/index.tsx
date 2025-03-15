import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FangOfTheMountainKing'
const [, trm] = trans('weapon', key)

const [condStacksPath, condStacks] = cond(key, 'stacks')
const stacksArr = range(1, 6)
const skill_dmg_arr = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const skill_dmg_ = lookup(
  condStacks,
  objKeyMap(stacksArr, (stack) =>
    prod(
      stack,
      subscript(input.weapon.refinement, skill_dmg_arr, { unit: '%' }),
    ),
  ),
  naught,
)
const burst_dmg_ = { ...skill_dmg_ }

const data = dataObjForWeaponSheet(key, {
  premod: {
    skill_dmg_,
    burst_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condStacks,
      path: condStacksPath,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objKeyMap(stacksArr, (stacks) => ({
        name: st('stack', { count: stacks }),
        fields: [
          {
            node: skill_dmg_,
          },
          {
            node: burst_dmg_,
          },
          {
            text: stg('duration'),
            value: 6,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
