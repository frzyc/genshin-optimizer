import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { input, subscript } from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TheStringless'

const refinementVals = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const skill_dmg_ = subscript(input.weapon.refinement, refinementVals)
const burst_dmg_ = subscript(input.weapon.refinement, refinementVals)

export const data = dataObjForWeaponSheet(key, {
  premod: {
    skill_dmg_,
    burst_dmg_,
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
          node: burst_dmg_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
