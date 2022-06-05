import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "AquaSimulacra"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const hp_arr = [0.16, 0.2, 0.24, 0.28, 0.32]
const dmg_arr = [0.2, 0.25, 0.3, 0.35, 0.4]

const [condPassivePath, condPassive] = cond(key, "passive")

const base_hp_ = subscript(input.weapon.refineIndex, hp_arr)
const cond_dmg_ = equal(condPassive, "on", subscript(input.weapon.refineIndex, dmg_arr))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    hp_: base_hp_,
    all_dmg_: cond_dmg_,
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: base_hp_,
    }]
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("condName"),
    states: {
      on: {
        fields: [{
          node: cond_dmg_
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
