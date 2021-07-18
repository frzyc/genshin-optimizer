import { WeaponData } from 'pipeline'
import { IConditionals, IConditionalValue } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Serpent_Spine.png'

const dmg_s = [6, 7, 8, 9, 10]
const takeDMG_s = [3, 2.7, 2.4, 2.2, 2]
const conditionals: IConditionals = {
  w: {
    name: "Duration on Field (4s / stack)",
    maxStack: 5,
    stats: stats => ({
      dmg_: dmg_s[stats.weapon.refineIndex]
    }),
    fields: [{
      text: "Take more DMG",
      value: stats => {
        const value = stats.conditionalValues?.weapon?.SerpentSpine?.w as IConditionalValue | undefined
        const [num,] = value ?? [0]
        return takeDMG_s[stats.weapon.refineIndex] * num
      },
      unit: "%"
    }]
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.w
  }],
}
export default weapon