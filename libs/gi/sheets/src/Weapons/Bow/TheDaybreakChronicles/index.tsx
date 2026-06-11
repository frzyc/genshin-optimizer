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
import { cond, st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TheDaybreakChronicles'

const dmg_arr = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]

const passiveArr = range(1, 6)
const [condPassivePath, condPassive] = cond(key, 'passive')
const passiveMult = lookup(
  condPassive,
  objKeyMap(passiveArr, (v) => constant(v)),
  naught
)

const normal_dmg_ = prod(
  passiveMult,
  subscript(input.weapon.refinement, dmg_arr)
)
const skill_dmg_ = { ...normal_dmg_ }
const burst_dmg_ = { ...normal_dmg_ }

const data = dataObjForWeaponSheet(key, {
  premod: {
    normal_dmg_,
    skill_dmg_,
    burst_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('stacks'),
      states: objKeyMap(passiveArr, (v) => ({
        name: `${v}`,
        fields: [
          {
            node: normal_dmg_,
          },
          {
            node: skill_dmg_,
          },
          {
            node: burst_dmg_,
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
