import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Harbinger_of_Dawn.png'

const refinementVals = [14, 17.5, 21, 24.5, 28]
const conditionals: IConditionals = {
  v: {
    name: "HP > 90%",
    maxStack: 1,
    stats: stats => ({
      critRate_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.v
  }],
}
export default weapon