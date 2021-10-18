import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementCritVals = [3, 4, 5, 6, 7]
const refinementAtkVals = [7, 8, 9, 10, 11]
const conditionals: IConditionals = {
  lau: {
    name: "Liyue Members",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementAtkVals[stats.weapon.refineIndex],
      critRate_: refinementCritVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  conditionals,
  document: [{
    conditional: conditionals.lau
  }],
}
export default weapon