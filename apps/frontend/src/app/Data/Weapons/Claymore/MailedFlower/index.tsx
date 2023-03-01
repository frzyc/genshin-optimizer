import { WeaponKey } from '@genshin-optimizer/consts'
import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st, stg, trans } from '../../../SheetUtil'
import { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = "MailedFlower"
const data_gen = data_gen_json as WeaponData

const [, trm] = trans("weapon", key)

const atk_arr = [0.12, 0.15, 0.18, 0.21, 0.24]
const eleMasArr = [48, 60, 72, 84, 96]
const [condPassivePath, condPassive] = cond(key, "passive")
const atk_ = equal(condPassive, "on", subscript(input.weapon.refineIndex, atk_arr, { unit: "%" }))
const eleMas = equal(condPassive, "on", subscript(input.weapon.refineIndex, eleMasArr))
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    eleMas,
  },
})
const sheet: IWeaponSheet = {
  document: [{
    value: condPassive,
    path: condPassivePath,
    name: trm("condName"),
    header: headerTemplate(key, st("conditional")),
    states: {
      on: {
        fields: [{
          node: atk_,
        }, {
          node: eleMas
        }, {
          text: stg("duration"),
          value: 8,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
