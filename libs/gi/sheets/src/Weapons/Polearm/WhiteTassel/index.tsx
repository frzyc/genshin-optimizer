import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { input, subscript } from '@genshin-optimizer/gi/wr'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'WhiteTassel'
const dmgInc = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const normal_dmg_ = subscript(input.weapon.refinement, dmgInc)
const data = dataObjForWeaponSheet(key, {
  premod: {
    normal_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: normal_dmg_,
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
