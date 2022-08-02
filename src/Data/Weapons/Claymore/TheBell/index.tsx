import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { infoMut, equal, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customShieldNode } from '../../../Characters/dataUtil'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "TheBell"
const data_gen = data_gen_json as WeaponData

const shieldSrc = [0.2, 0.23, 0.26, 0.29, 0.32]
const allDmgSrc = [0.12, 0.15, 0.18, 0.21, 0.24]
const [condPassivePath, condPassive] = cond(key, "RebelliousGuardian")
const shield = equal(input.weapon.key, key,
  equal(condPassive, "on", customShieldNode(prod(subscript(input.weapon.refineIndex, shieldSrc, { key: "_" }), input.total.hp))))
const [condWithShieldPath, condWithShield] = cond(key, "WithShield")
const all_dmg_ = equal(condWithShield, "protected", subscript(input.weapon.refineIndex, allDmgSrc, { key: "_" }))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_
  }
}, {
  shield
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("takeDmg"),
    states: {
      on: {
        fields: [{
          node: infoMut(shield, { key: `sheet_gen:dmgAbsorption` })
        }, {
          text: sgt("cd"),
          value: 45,
          unit: "s"
        }]
      }
    }
  }, {
    value: condWithShield,
    path: condWithShieldPath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("protectedByShield"),
    states: {
      protected: {
        fields: [{
          node: all_dmg_
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
