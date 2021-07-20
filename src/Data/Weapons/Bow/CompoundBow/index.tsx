import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Compound_Bow.png'

const refinementVals = [4, 5, 6, 7, 8]
const refinementSpdVals = [1.2, 1.5, 1.8, 2.1, 2.4]
const conditionals: IConditionals = {
  ia: {
    name: "Normal/Charged Attack Hits",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex],
      atkSPD_: refinementSpdVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.ia
  }],
}
export default weapon