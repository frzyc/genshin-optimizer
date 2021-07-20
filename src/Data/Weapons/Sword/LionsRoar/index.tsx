import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Lion\'s_Roar.png'

const refinementVals = [20, 24, 28, 32, 36]
const conditionals: IConditionals = {
  bft: {
    name: "Against Opponents Affected by Pyro/Electro",
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
    conditional: conditionals.bft
  }],
}
export default weapon