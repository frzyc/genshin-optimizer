import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Skyrider_Greatsword.png'

const refinementVals = [6, 7, 8, 9, 10]
const conditionals: IConditionals = {
  c: {
    name: "Normal/Charged Attack Hits",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
}
export default weapon