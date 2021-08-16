import { WeaponData } from 'pipeline'
import { TransWrapper } from '../../../../Components/Translate'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Song_of_Broken_Pines.png'
const atk_ = [16, 20, 24, 28, 32]
const atkSPD_ = [12, 15, 18, 21, 24]
const condAtk_ = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  r: {
    name: <TransWrapper ns="weapon_SongOfBrokenPines" key18="name" />,
    stats: stats => ({
      atk_: condAtk_[stats.weapon.refineIndex],
      atkSPD_: atkSPD_[stats.weapon.refineIndex],
    }),
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    atk_: atk_[stats.weapon.refineIndex]
  }),
  conditionals,
  document: [{
    conditional: conditionals.r
  }],
}
export default weapon