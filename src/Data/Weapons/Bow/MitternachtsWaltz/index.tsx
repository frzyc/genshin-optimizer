import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const skill_ = [20, 25, 30, 35, 40]
const normal_ = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "a",
      name: <Translate ns="sheet" key18="hitOp.normal" />,
      stats: stats => ({
        skill_dmg_: skill_[stats.weapon.refineIndex],
      })
    },
  }, {
    conditional: {
      key: "s",
      name: <Translate ns="sheet" key18="hitOp.skill" />,
      stats: stats => ({
        normal_dmg_: normal_[stats.weapon.refineIndex],
      })
    }
  }],
}
export default weapon