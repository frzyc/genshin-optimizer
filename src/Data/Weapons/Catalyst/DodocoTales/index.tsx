import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const cdmg_ = [16, 20, 24, 28, 32]
const atk_ = [8, 10, 12, 14, 16]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "a",
      name: <Translate ns="sheet" key18="hitOp.normal" />,
      stats: stats => ({
        charged_dmg_: cdmg_[stats.weapon.refineIndex],
      })
    },
  }, {
    conditional: {
      key: "c",
      name: <Translate ns="sheet" key18="hitOp.charged" />,
      stats: stats => ({
        atk_: atk_[stats.weapon.refineIndex],
      })
    }
  }],
}
export default weapon