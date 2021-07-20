import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Mappa_Mare.png'

const dmg_s = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  is: {
    name: "Elemental Reactions",
    maxStack: 2,
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
    conditional: conditionals.is
  }],
}
export default weapon