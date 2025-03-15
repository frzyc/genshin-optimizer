import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  percent,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'LostPrayerToTheSacredWinds'
const ele_dmg_s = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]

const [condPassivePath, condPassive] = cond(key, 'BoundlessBlessing')

const moveSPD_ = percent(0.1)
const eleDmgInc = subscript(input.weapon.refinement, ele_dmg_s, { unit: '%' })
const eleDmgStacks = Object.fromEntries(
  allElementKeys.map((ele) => [
    ele,
    lookup(
      condPassive,
      {
        ...objKeyMap(range(1, 4), (i) => prod(eleDmgInc, i)),
      },
      naught,
    ),
  ]),
)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    moveSPD_,
    ...Object.fromEntries(
      allElementKeys.map((ele) => [`${ele}_dmg_`, eleDmgStacks[ele]]),
    ),
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: moveSPD_ }],
    },
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('timeOnField'),
      states: objKeyMap(range(1, 4), (i) => ({
        name: st('seconds', { count: i * 4 }),
        fields: allElementKeys.map((ele) => ({ node: eleDmgStacks[ele] })),
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
