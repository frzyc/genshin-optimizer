import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, infoMut, prod, subscript } from '../../../../Formula/utils'
import { allElements, WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SkywardAtlas"
const data_gen = data_gen_json as WeaponData

const dmgBonus = [0.12, 0.15, 0.18, 0.21, 0.24]
const eleBonus_ = Object.fromEntries(allElements.map(ele => [ele, subscript(input.weapon.refineIndex, dmgBonus)]))
const dmgPerc = [1.6, 2, 2.4, 2.8, 3.2]
// TODO: Is the customDmgNode correct?
const dmg = customDmgNode(prod(subscript(input.weapon.refineIndex, dmgPerc, { key: "_" }), input.total.atk), "elemental", {
  hit: { ele: constant("physical") }
})
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    ...Object.fromEntries(allElements.map(ele => [`${ele}_dmg_`, eleBonus_[ele]])),
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [
      ...allElements.map(ele => ({ node: eleBonus_[ele] })),
      {
        node: infoMut(dmg, { key: "sheet:dmg" }),
      }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
