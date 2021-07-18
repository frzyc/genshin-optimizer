import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Slingshot.png'

const refinementVals = [36, 42, 48, 54, 60]
const conditionals: IConditionals = {
  s: {
    name: "Normal/Charged Attack Hits within 0.3s",
    maxStack: 1,
    stats: stats => ({
      // TODO: Shouldn't we exclude elemental skill/burst?
      dmg_: refinementVals[stats.weapon.refineIndex] + 10//+10 to neutralize the -10
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: () => ({
    dmg_: -10
  }),
  conditionals,
  document: [{
    conditional: conditionals.s
  }],
}
export default weapon