import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Mitternachts_Waltz.png'
const skill_ = [20, 25, 30, 35, 40]
const normal_ = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  a: {
    name: <Translate ns="sheet" key18="hitOp.normal" />,
    stats: stats => ({
      skill_dmg_: skill_[stats.weapon.refineIndex],
    })
  },
  s: {
    name: <Translate ns="sheet" key18="hitOp.skill" />,
    stats: stats => ({
      normal_dmg_: normal_[stats.weapon.refineIndex],
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  conditionals
}
export default weapon