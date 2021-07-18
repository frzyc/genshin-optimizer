import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Serpent_Spine.png'

const refinementVals = [6, 7, 8, 9, 10]
const refinementTakeDmgVals = [3, 2.7, 2.4, 2.2, 2]
const conditionals: IConditionals = {
  w: {
    name: "Duration on Field (4s / stack)",
    maxStack: 5,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  conditionals,
}
export default weapon