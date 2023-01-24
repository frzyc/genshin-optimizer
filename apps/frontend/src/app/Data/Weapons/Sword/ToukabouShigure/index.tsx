import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '@genshin-optimizer/consts'
import { cond, st, stg, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "ToukabouShigure"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "passive")
const all_dmg_arr = [0.16, 0.20, 0.24, 0.28, 0.32]
const all_dmg_ = equal(input.weapon.key, key, equal(condPassive, "on", subscript(input.weapon.refineIndex, all_dmg_arr, { unit: "%" })))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_
  }
})
const sheet: IWeaponSheet = {
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, st("stacks")),
    name: trm("condName"),
    states: {
      on: {
        fields: [{
          node: all_dmg_,
        }, {
          text: stg("duration"),
          value: 10,
          unit: "s",
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
