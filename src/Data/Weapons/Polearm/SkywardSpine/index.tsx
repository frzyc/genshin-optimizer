import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, percent, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SkywardSpine"
const data_gen = data_gen_json as WeaponData

const critRateInc = [0.08, 0.1, 0.12, 0.14, 0.16]
const dmgPerc = [0.4, 0.55, 0.7, 0.85, 1]
const atkSPD_ = percent(0.12)
const critRate_ = subscript(input.weapon.refineIndex, critRateInc)
const dmg = equal(input.weapon.key, key,
  customDmgNode(prod(subscript(input.weapon.refineIndex, dmgPerc, { key: "_" }), input.total.atk), "elemental", {
    hit: { ele: constant("physical") }
  }))
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critRate_,
    atkSPD_
  }
}, {
  dmg
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: critRate_,
    }, {
      node: atkSPD_,
    }, {
      node: infoMut(dmg, { key: "sheet:dmg" }),
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
