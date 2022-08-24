import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import { allElements, WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "HuntersPath"
const data_gen = data_gen_json as WeaponData

const allEle_dmg_arr = [0.12, 0.15, 0.18, 0.21, 0.24]
const allEle_dmg_ = Object.fromEntries(allElements.map(ele => [
  `${ele}_dmg_`,
  subscript(input.weapon.refineIndex, allEle_dmg_arr, { key: "_" })
]))

const charged_dmgIncArr = [1.6, 2, 2.4, 2.8, 3.2]
const [condPassivePath, condPassive] = cond(key, "passive")
const charged_dmgInc = equal(condPassive, "on",
  prod(
    subscript(input.weapon.refineIndex, charged_dmgIncArr, { key: "_" }),
    input.total.eleMas
  ))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...allEle_dmg_,
    charged_dmgInc,
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: Object.values(allEle_dmg_).map(node => ({
      node
    }))
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: st("hitOp.charged"),
    states: {
      on: {
        fields: [{
          node: charged_dmgInc,
        }, {
          text: sgt("duration"),
          value: 10,
          unit: "s"
        }, {
          text: st("charges"),
          value: 12
        }, {
          text: sgt("cd"),
          value: 12,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
