import { IWeaponSheet } from '../../../../Types/weapon'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
const normal_dmg_s = [16, 20, 24, 28, 32]
const charged_dmg_s = [12, 15, 18, 21, 24]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    normal_dmg_: normal_dmg_s[stats.weapon.refineIndex],
    charged_dmg_: charged_dmg_s[stats.weapon.refineIndex]
  }),
  document: [{
    conditional: {//100% energy
      key: "e",
      name: <Translate ns="weapon_Hamayumi" key18="ener" />,
      stats: stats => ({
        normal_dmg_: normal_dmg_s[stats.weapon.refineIndex],
        charged_dmg_: charged_dmg_s[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon