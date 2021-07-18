import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Royal_Spear.png'

const crit_ = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  f: {
    name: "Opponents Damaged",
    maxStack: 5,
    stats: stats => ({
      critRate_: crit_[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.f
  }],
}
export default weapon