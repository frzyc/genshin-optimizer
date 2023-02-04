import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, percent, subscript, sum } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import { WeaponKey } from '@genshin-optimizer/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = "Slingshot"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const dmg_arr = [.36, .42, .48, .54, .60]

const [condPassivePath, condPassive] = cond(key, "Slingshot")
const normal_dmg_inc = equal(condPassive, "on", subscript(input.weapon.refineIndex, dmg_arr), KeyMap.info("normal_dmg_"))
const charged_dmg_inc = equal(condPassive, "on", subscript(input.weapon.refineIndex, dmg_arr), KeyMap.info("charged_dmg_"))
const normal_dmg_dec = equal(condPassive, undefined, percent(-0.1, KeyMap.info("normal_dmg_")))
const charged_dmg_dec = equal(condPassive, undefined, percent(-0.1, KeyMap.info("charged_dmg_")))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_: sum(normal_dmg_inc, normal_dmg_dec),
    charged_dmg_: sum(charged_dmg_inc, charged_dmg_dec),
  }
})

const sheet: IWeaponSheet = {
  document: [{
    header: headerTemplate(key, st("base")),
    fields: [{
      node: normal_dmg_dec
    }, {
      node: charged_dmg_dec
    }],
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, st("conditional")),
    name: trm("condName"),
    states: {
      on: {
        fields: [{
          node: normal_dmg_inc
        }, {
          node: charged_dmg_inc
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
