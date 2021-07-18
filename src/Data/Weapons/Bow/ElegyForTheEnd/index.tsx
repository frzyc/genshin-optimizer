import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Elegy_for_the_End.png'

const refinementEM = [60, 75, 90, 105, 120]
const refinementIncEM = [100, 125, 150, 175, 200]
const refinementATK_ = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  pr: {
    name: "Millennial Movement: Farewell Song",
    maxStack: 1,
    stats: stats => ({
      eleMas: refinementIncEM[stats.weapon.refineIndex],
      atk_: refinementATK_[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    eleMas: refinementEM[stats.weapon.refineIndex],
  }),
  conditionals,
}
export default weapon