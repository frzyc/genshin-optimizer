import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, prod, subscript } from '../../../../Formula/utils'
import { allElementKeys, WeaponKey } from '@genshin-optimizer/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "SkywardAtlas"
const data_gen = data_gen_json as WeaponData

const dmgBonus = [0.12, 0.15, 0.18, 0.21, 0.24]
const eleBonus_ = Object.fromEntries(allElementKeys.map(ele => [ele, subscript(input.weapon.refineIndex, dmgBonus)]))
const dmgPerc = [1.6, 2, 2.4, 2.8, 3.2]

const dmg = equal(input.weapon.key, key,
  customDmgNode(prod(subscript(input.weapon.refineIndex, dmgPerc, { unit: "%" }), input.total.atk), "elemental", {
    hit: { ele: constant("physical") }
  }))
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...Object.fromEntries(allElementKeys.map(ele => [`${ele}_dmg_`, eleBonus_[ele]])),
  }
}, { dmg })

const sheet: IWeaponSheet = {
  document: [{
    header: headerTemplate(key, st("base")),
    fields: [
      ...allElementKeys.map(ele => ({ node: eleBonus_[ele] })),
      {
        node: infoMut(dmg, { name: st("dmg") }),
      }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
