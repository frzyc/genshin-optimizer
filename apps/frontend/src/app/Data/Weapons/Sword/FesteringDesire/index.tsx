import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import { subscript } from '../../../../Formula/utils'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'FesteringDesire'
const data_gen = allStats.weapon.data[key]

const skill_dmgInc = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const skill_critInc = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const skill_dmg_ = subscript(input.weapon.refinement, skill_dmgInc, {
  unit: '%',
})
const skill_critRate_ = subscript(input.weapon.refinement, skill_critInc, {
  unit: '%',
})

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
    skill_critRate_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: skill_dmg_,
        },
        {
          node: skill_critRate_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
