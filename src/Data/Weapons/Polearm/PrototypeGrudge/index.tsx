import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Prototype_Grudge.png'

const dmg_ = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  ma: {
    name: "After Using Elemental Skills",
    maxStack: 2,
    stats: stats => ({
      normal_dmg_: dmg_[stats.weapon.refineIndex],
      charged_dmg_: dmg_[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.ma
  }],
}
export default weapon