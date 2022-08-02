import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "CinnabarSpindle"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const eleDmgIncSrc = [0.4, 0.5, 0.6, 0.7, 0.8]
const [condPassivePath, condPassive] = cond(key, "SpotlessHeart")
const skill_dmgInc = equal(input.weapon.key, key,
  equal("on", condPassive, prod(subscript(input.weapon.refineIndex, eleDmgIncSrc, { key: "_" }), input.premod.def)))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: { // TODO: should be total
    skill_dmgInc
  }
}, {
  skill_dmgInc
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("name"),
    states: {
      on: {
        fields: [{
          node: skill_dmgInc
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
