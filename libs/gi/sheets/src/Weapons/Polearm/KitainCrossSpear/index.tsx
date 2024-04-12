import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { input, subscript } from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'KitainCrossSpear'

const skill_dmgInc = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const skill_dmg_ = subscript(input.weapon.refinement, skill_dmgInc)
const data = dataObjForWeaponSheet(key, {
  premod: {
    skill_dmg_,
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
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
