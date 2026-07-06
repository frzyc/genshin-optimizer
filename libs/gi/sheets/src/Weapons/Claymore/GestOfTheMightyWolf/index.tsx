import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  greaterEq,
  input,
  lookup,
  naught,
  prod,
  subscript,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'GestOfTheMightyWolf'

const dmg_arr = [-1, 0.075, 0.095, 0.115, 0.135, 0.155]
const critDMG_arr = [-1, 0.075, 0.095, 0.115, 0.135, 0.155]

const [condStacksPath, condStacks] = cond(key, 'stacks')
const stacksArr = range(1, 4)
const stacks = lookup(
  condStacks,

  objKeyMap(stacksArr, (symbol) => constant(symbol)),
  naught
)
const dmg_ = prod(
  stacks,
  subscript(input.weapon.refinement, dmg_arr, { unit: '%' })
)
const critDMG_ = greaterEq(
  tally.hexerei,
  2,
  prod(stacks, subscript(input.weapon.refinement, critDMG_arr, { unit: '%' }))
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    all_dmg_: dmg_,
    critDMG_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condStacks,
      path: condStacksPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: st('stacks'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: dmg_,
          },
          {
            node: critDMG_,
          },
          {
            text: stg('duration'),
            value: 4,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: 0.01,
            unit: 's',
            fixed: 2,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
