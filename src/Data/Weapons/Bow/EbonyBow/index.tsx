import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Ebony_Bow.png'

const dmg_s = [40, 50, 60, 70, 80]
const conditionals: IConditionals = {
  d: {
    name: "Against Ruin Opponents",
    maxStack: 1,
    stats: stats => ({
      dmg_: dmg_s[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.d
  }],
}
export default weapon