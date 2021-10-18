import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const atk_s = [20, 25, 30, 35, 40]
const atk_partys = [40, 50, 60, 70, 80]
const conditionals: IConditionals = {
  wt: {
    name: "Attacked Opponent with Low HP",//TODO: party buff
    maxStack: 1,
    stats: stats => ({
      atk_: atk_partys[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    atk_: atk_s[stats.weapon.refineIndex]
  }),
  conditionals,
  document: [{
    conditional: conditionals.wt
  }],
}
export default weapon