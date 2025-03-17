import { type WeaponKey, allElementKeys } from '@genshin-optimizer/gi/consts'
import {
  equal,
  greaterEq,
  input,
  subscript,
  sum,
  tally,
  target,
  threshold,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'AstralVulturesCrimsonPlumage'

const atk_arr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const charged_dmg_arr1 = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const charged_dmg_arr2 = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]
const burst_dmg_arr1 = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const burst_dmg_arr2 = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const [condPassivePath, condPassive] = cond(key, 'passive')
const atk_ = equal(
  condPassive,
  'on',
  subscript(input.weapon.refinement, atk_arr)
)
const otherEleMembers = sum(
  ...allElementKeys.map((ele) => unequal(target.charEle, ele, tally[ele]))
)
const charged_dmg_ = threshold(
  otherEleMembers,
  2,
  subscript(input.weapon.refinement, charged_dmg_arr2),
  greaterEq(
    otherEleMembers,
    1,
    subscript(input.weapon.refinement, charged_dmg_arr1)
  )
)
const burst_dmg_ = threshold(
  otherEleMembers,
  2,
  subscript(input.weapon.refinement, burst_dmg_arr2),
  greaterEq(
    otherEleMembers,
    1,
    subscript(input.weapon.refinement, burst_dmg_arr1)
  )
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_,
    charged_dmg_,
    burst_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: st('swirlReaction.base'),
      states: {
        on: {
          fields: [
            {
              node: atk_,
            },
            {
              text: stg('duration'),
              value: 12,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      header: headerTemplate(key, st('stacks')),
      fields: [
        {
          node: charged_dmg_,
        },
        {
          node: burst_dmg_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
