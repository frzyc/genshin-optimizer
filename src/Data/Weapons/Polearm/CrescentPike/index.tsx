import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "CrescentPike"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const atkInc = [0.2, 0.25, 0.3, 0.35, 0.4]
const [condPassivePath, condPassive] = cond(key, "InfusionNeedle")
const hit = equal(input.weapon.key, key,
  equal(condPassive, 'on', customDmgNode(prod(input.total.atk, subscript(input.weapon.refineIndex, atkInc, { key: "_" })), "elemental", {
    hit: { ele: constant("physical") }
  })))
const data = dataObjForWeaponSheet(key, data_gen, undefined, { hit })

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken),
    name: trm("condName"),
    states: {
      on: {
        fields: [{
          node: infoMut(hit, { key: `weapon_${key}:hitName` })
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
