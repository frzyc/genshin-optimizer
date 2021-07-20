import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Sacrificial_Sword.png'

const conditionals: IConditionals = {
  c: {
    name: "Elemental Skill Resets CD",
    maxStack: 1,
    stats: () => ({
      cdRed_: 100
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: []
}
export default weapon