import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "FilletBlade"
const data_gen = data_gen_json as WeaponData

const dmg_Src = [2.4, 2.8, 3.2, 3.6, 4]
const cd_Src = [15, 14, 13, 12, 11]
const dmg_ = equal(input.weapon.key, key,
  customDmgNode(prod(subscript(input.weapon.refineIndex, dmg_Src, { unit: "%" }), input.premod.atk), "elemental", {
    hit: { ele: constant("physical") }
  }))

const data = dataObjForWeaponSheet(key, data_gen, undefined, {
  dmg_
})
const sheet: IWeaponSheet = {
  document: [{
    header: headerTemplate(key, st("base")),
    fields: [{
      node: infoMut(dmg_, { name: st("dmg") })
    }, {
      text: stg("cd"),
      value: (data) => cd_Src[data.get(input.weapon.refineIndex).value],
      unit: "s"
    }]
  }]
}
export default new WeaponSheet(key, sheet, data_gen, data)
