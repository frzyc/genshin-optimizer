import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Lost_Prayer_to_the_Sacred_Winds.png'

const refinementVals = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  bb: {
    name: "Duration on Field (4s / stack)",
    maxStack: 4,
    stats: stats => ({
      anemo_dmg_: refinementVals[stats.weapon.refineIndex],
      geo_dmg_: refinementVals[stats.weapon.refineIndex],
      electro_dmg_: refinementVals[stats.weapon.refineIndex],
      hydro_dmg_: refinementVals[stats.weapon.refineIndex],
      pyro_dmg_: refinementVals[stats.weapon.refineIndex],
      cryo_dmg_: refinementVals[stats.weapon.refineIndex],
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: () => ({
    moveSPD_: 10
  }),
  conditionals,
  document: [{
    conditional: conditionals.bb
  }],
}
export default weapon