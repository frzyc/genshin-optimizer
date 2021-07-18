import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Raven_Bow.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  bfw: {
    name: "Against Opponents Affected by Hydro/Pyro",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  conditionals
}
export default weapon