import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "OathswornEye"
const data_gen = data_gen_json as WeaponData

const refinementVals = [0.24, 0.30, 0.36, 0.42, 0.48]

const [condSkillBurstPath, condSkillBurst] = cond(key, "faLight")
const refineVal = subscript(input.weapon.refineIndex, refinementVals)
const enerRech_ = equal("skillBurst", condSkillBurst, refineVal)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    enerRech_,
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condSkillBurst,
    path: condSkillBurstPath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("afterUse.skill"),
    states: {
      skillBurst: {
        fields: [{
          node: enerRech_
        }]
      },
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
