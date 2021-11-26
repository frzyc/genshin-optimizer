import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const refinementVals = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "ss",
      name: "Hits",
      states: {
        n: {
          name: "Normal attack",
          stats: stats => ({
            skill_dmg_: refinementVals[stats.weapon.refineIndex],
            burst_dmg_: refinementVals[stats.weapon.refineIndex],
          })
        },
        s: {
          name: "Skill or Burst",
          stats: stats => ({
            normal_dmg_: refinementVals[stats.weapon.refineIndex]
          })
        },
        b: {
          name: "Both Normal & Skill/Burst",
          stats: stats => ({
            skill_dmg_: refinementVals[stats.weapon.refineIndex],
            burst_dmg_: refinementVals[stats.weapon.refineIndex],
            normal_dmg_: refinementVals[stats.weapon.refineIndex]
          })
        }
      }
    }
  }],
}
export default weapon