import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const shield_ = [20, 25, 30, 35, 40]
const atk_ = [4, 5, 6, 7, 8]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    shield_: shield_[stats.weapon.refineIndex]
  }),
  document: [{
    conditional: {
      key: "gm",
      name: "Hits",
      states: {
        wo: {
          name: "Without shield",
          maxStack: 5,
          stats: stats => ({
            atk_: atk_[stats.weapon.refineIndex]
          })
        },
        w: {
          name: "With shield",
          maxStack: 5,
          stats: stats => ({
            atk_: 2 * atk_[stats.weapon.refineIndex]
          })
        }
      }
    }
  }],
}
export default weapon