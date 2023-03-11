import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'KatsuragikiriNagamasa'
const data_gen = data_gen_json as WeaponData

const skill_dmg_Src = [0.06, 0.075, 0.09, 0.105, 0.12]
const skill_dmg_ = subscript(input.weapon.refineIndex, skill_dmg_Src)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmg_,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: skill_dmg_ }],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
