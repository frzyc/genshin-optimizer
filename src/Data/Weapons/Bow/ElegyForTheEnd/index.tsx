import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementEM = [60, 75, 90, 105, 120]
const eleMass = [100, 125, 150, 175, 200]
const atk_s = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  pr: {
    name: "Millennial Movement: Farewell Song",
    stats: stats => ({
      eleMas: eleMass[stats.weapon.refineIndex],
      atk_: atk_s[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    eleMas: refinementEM[stats.weapon.refineIndex],
  }),
  conditionals,
  document: [{
    conditional: conditionals.pr
  }],
}
export default weapon