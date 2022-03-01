import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, infoMut, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "PrototypeArchaic"
const data_gen = data_gen_json as WeaponData
const dmg_Src = [1, 1.25, 1.5, 1.75, 2]

// TODO: Is this the correct formula for the dmg dealt?
const dmg_ = customDmgNode(prod(subscript(input.weapon.refineIndex, dmg_Src, { key: "_" }), input.premod.atk), "elemental", {
  hit: { ele: constant("physical") }
})

const data = dataObjForWeaponSheet(key, data_gen)

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{ node: infoMut(dmg_, { key: "sheet:dmg" }) }],
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
