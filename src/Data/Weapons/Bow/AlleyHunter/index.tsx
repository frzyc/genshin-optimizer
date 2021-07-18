import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Alley_Hunter.png'

const refinementVals = [2, 2.5, 3, 3.5, 4]
const conditionals: IConditionals = {
  ug: {
    name: "Duration not on Field (1s / stack)",
    maxStack: 10,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex],
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.ug
  }],
}
export default weapon