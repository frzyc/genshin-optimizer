import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Ferrous_Shadow.png'

const refinementHpVals = [70, 75, 80, 85, 90]
const refinementVals = [30, 35, 40, 45, 50]
const conditionals: IConditionals = {
  u: {
    name: "Low HP",
    maxStack: 1,
    stats: stats => ({
      charged_dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
}
export default weapon