import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Whiteblind.png'
const atk_def_s = [6, 7.5, 9, 10.5, 12]
const conditionals: IConditionals = {
  infusionBlade: {
    name: "Normal/Charged Attack Hits",
    maxStack: 4,
    stats: stats => ({
      atk_: atk_def_s[stats.weapon.refineIndex],
      def_: atk_def_s[stats.weapon.refineIndex]
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
    conditional: conditionals.infusionBlade
  }],
}
export default weapon