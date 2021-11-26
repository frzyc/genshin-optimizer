import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import { st } from '../../../Characters/SheetUtil'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const dmg_ = [8, 10, 12, 14, 16]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ma",
      name: st("afterUse.skill"),
      maxStack: 2,
      stats: stats => ({
        normal_dmg_: dmg_[stats.weapon.refineIndex],
        charged_dmg_: dmg_[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon