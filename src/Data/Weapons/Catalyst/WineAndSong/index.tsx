import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Wine_and_Song.png'

// const refinementSprintVals = [14, 16, 18, 20, 22]
const atk_s = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  ws: {
    name: "After Sprint",
    maxStack: 1,
    stats: stats => ({
      atk_: atk_s[stats.weapon.refineIndex],//TODO: stamine decrease for sprint
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.ws
  }],
}
export default weapon