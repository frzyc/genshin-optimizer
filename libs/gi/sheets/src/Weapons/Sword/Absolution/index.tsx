import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
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

const key: WeaponKey = 'Absolution'
const data_gen = allStats.weapon.data[key]

const critDMG_arr = data_gen.refinementBonus.critDMG_!
const critDMG_ = subscript(input.weapon.refinement, critDMG_arr)

const dmg_arr = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const bondStacksArr = range(1, 3)
const [condBondStacksPath, condBondStacks] = cond(key, 'bondStacks')
const bondStacks_dmg_ = lookup(
  condBondStacks,
  objKeyMap(bondStacksArr, (stack) =>
    prod(subscript(input.weapon.refinement, dmg_arr), stack),
  ),
  naught,
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    critDMG_,
    all_dmg_: bondStacks_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: critDMG_,
        },
      ],
    },
    {
      value: condBondStacks,
      path: condBondStacksPath,
      header: headerTemplate(key, st('conditional')),
      name: st('bond.increases'),
      states: objKeyMap(bondStacksArr, (stack) => ({
        name: st('times', { count: stack }),
        fields: [
          {
            node: bondStacks_dmg_,
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
