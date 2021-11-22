import { IWeaponSheet } from '../../../../Types/weapon'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
const atk_s = [20, 25, 30, 35, 40]
const ele_dmg_ss = [
  [12, 24, 40],
  [15, 30, 50],
  [18, 36, 60],
  [21, 42, 70],
  [24, 48, 80]
]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({ atk_: atk_s[stats.weapon.refineIndex] }),
  document: [{
    conditional: {
      key: "em",
      name: <Translate ns="weapon_ThunderingPulse" key18="emblem" />,
      states: Object.fromEntries([1, 2, 3].map(stacks => [stacks, {
        name: <Translate ns="sheet" key18="stack" values={{ count: stacks }} />,
        stats: stats => {
          return {
            normal_dmg_: ele_dmg_ss[stats.weapon.refineIndex][stacks - 1]
          }
        }
      }]))
    }
  }],
}
export default weapon