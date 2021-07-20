import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Cool_Steel.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  bwi: {
    name: "Against Opponents Affected by Hydro/Cryo",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.bwi
  }],
}
export default weapon