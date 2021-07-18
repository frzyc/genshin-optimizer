import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Dark_Iron_Sword.png'

const refinementVals = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  em: {
    name: "After Electro-related reactions",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.em
  }],
}
export default weapon