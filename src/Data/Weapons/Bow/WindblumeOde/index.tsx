import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Windblume_Ode.png'

const atk_s = [16, 20, 24, 28, 32]
const conditionals: IConditionals = {
  ww: {
    name: "After Elemental Skill",
    maxStack: 1,
    stats: stats => ({
      atk_: atk_s[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.ww
  }],
}
export default weapon