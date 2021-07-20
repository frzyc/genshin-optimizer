import { WeaponData } from 'pipeline'
import { TransWrapper } from '../../../../Components/Translate'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Freedom-Sworn.png'
const dmg_ = [10, 12.5, 15, 17.5, 20]
const auto = [16, 20, 24, 28, 32]
const atk_ = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  r: {
    name: <TransWrapper ns="weapon_FreedomSworn" key18="name" />,
    stats: stats => ({
      atk_: atk_[stats.weapon.refineIndex],
      normal_dmg_: auto[stats.weapon.refineIndex],
      charged_dmg_: auto[stats.weapon.refineIndex],
      plunging_dmg_: auto[stats.weapon.refineIndex],
    }),
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    dmg_: dmg_[stats.weapon.refineIndex]
  }),
  conditionals,
  document: [{
    conditional: conditionals.r
  }],
}
export default weapon