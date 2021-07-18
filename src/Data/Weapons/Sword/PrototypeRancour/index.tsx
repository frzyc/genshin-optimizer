import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Prototype_Rancour.png'

const refinementVals = [4, 5, 6, 7, 8]
const conditionals: IConditionals = {
  smashedStone: {
    name: "Normal/Charged Attack Hits",
    maxStack: 4,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex],
      def_: refinementVals[stats.weapon.refineIndex]
    }),
    fields: [{
      text: "Duration",
      value: "6s"
    }]
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.smashedStone
  }],
}
export default weapon