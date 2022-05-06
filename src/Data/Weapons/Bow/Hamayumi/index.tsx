import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript, sum } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "Hamayumi"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const normal_dmg_s = [.16, .20, .24, .28, .32]
const charged_dmg_s = [.12, .15, .18, .21, .24]

const normal_dmg = subscript(input.weapon.refineIndex, normal_dmg_s, { key: "normal_dmg_" })
const charged_dmg = subscript(input.weapon.refineIndex, charged_dmg_s, { key: "charged_dmg_" })

const [condPassivePath, condPassive] = cond(key, "FullDraw")
const normal_passive = equal(condPassive, "on", subscript(input.weapon.refineIndex, normal_dmg_s, { key: "normal_dmg_" }))
const charged_passive = equal(condPassive, "on", subscript(input.weapon.refineIndex, charged_dmg_s, { key: "charged_dmg_" }))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_: sum(normal_dmg, normal_passive),
    charged_dmg_: sum(charged_dmg, charged_passive)
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: normal_dmg
    }, {
      node: charged_dmg
    }],
  }, {
    value: condPassive,
    path: condPassivePath,
    name: trm("condName"),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: normal_passive
        }, {
          node: charged_passive
        }]
      }
    }
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)
