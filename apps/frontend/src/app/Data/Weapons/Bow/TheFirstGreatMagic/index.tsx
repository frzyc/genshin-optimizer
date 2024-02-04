import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input, tally } from '../../../../Formula'
import {
  compareEq,
  greaterEq,
  sum,
  lookup,
  unequal,
  equal,
  naught,
  subscript,
  threshold,
} from '../../../../Formula/utils'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TheFirstGreatMagic'
const data_gen = allStats.weapon.data[key]

const charged_dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const stackAtk_arrs = [
  [-1, 0.16, 0.2, 0.24, 0.28, 0.32],
  [-1, 0.32, 0.4, 0.48, 0.56, 0.64],
  [-1, 0.48, 0.6, 0.72, 0.84, 0.96],
]
const moveSPD_arrs = [
  [-1, 0.04, 0.06, 0.08, 0.1, 0.12],
  [-1, 0.07, 0.09, 0.11, 0.13, 0.15],
  [-1, 0.1, 0.12, 0.14, 0.16, 0.18],
]

const sameElementTeammates = lookup(input.charEle, tally, naught)
const otherElementTeammates = sum(
  ...allElementKeys.map((ele) =>
    greaterEq(tally[ele], 1, unequal(ele, input.charEle, tally[ele]))
  )
)
const charged_dmg_ = subscript(input.weapon.refinement, charged_dmg_arr)
const atk_ = threshold(
  sameElementTeammates,
  3,
  subscript(input.weapon.refinement, stackAtk_arrs[2]),
  compareEq(
    sameElementTeammates,
    2,
    subscript(input.weapon.refinement, stackAtk_arrs[1]),
    subscript(input.weapon.refinement, stackAtk_arrs[0])
  )
)
const moveSPD_ = threshold(
  otherElementTeammates,
  3,
  subscript(input.weapon.refinement, moveSPD_arrs[2]),
  compareEq(
    otherElementTeammates,
    2,
    subscript(input.weapon.refinement, moveSPD_arrs[1]),
    equal(
      otherElementTeammates,
      1,
      subscript(input.weapon.refinement, moveSPD_arrs[0])
    )
  )
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    charged_dmg_,
    atk_,
    moveSPD_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: charged_dmg_,
        },
      ],
    },
    {
      header: headerTemplate(key, st('stacks')),
      fields: [
        {
          node: atk_,
        },
        {
          canShow: (data) => data.get(moveSPD_).value > 0,
          node: moveSPD_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
