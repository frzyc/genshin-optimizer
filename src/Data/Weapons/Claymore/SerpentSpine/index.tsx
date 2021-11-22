import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
const dmg_s = [6, 7, 8, 9, 10]
const takeDMG_s = [3, 2.7, 2.4, 2.2, 2]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "w",
      name: "Duration on Field (4s / stack)",
      maxStack: 5,
      stats: stats => ({
        dmg_: dmg_s[stats.weapon.refineIndex]
      }),
      fields: [{
        text: "Take more DMG",
        value: stats => {
          const [num,] = stats.conditionalValues?.weapon?.SerpentSpine?.w ?? [0]
          return takeDMG_s[stats.weapon.refineIndex] * num
        },
        unit: "%"
      }]
    }
  }],
}
export default weapon