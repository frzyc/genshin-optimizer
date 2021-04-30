import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Quartz.png'

const refinementVals = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  rh: {
    name: "After Pyro-related Reactions",
    maxStack: 1,
    stats: stats => ({
      atk_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "Quartz",
  weaponType: "claymore",
  img,
  rarity: 3,
  passiveName: "Residual Heat",
  passiveDescription: stats => <span>Upon causing an Overloaded, Melt, Burning, Vaporize, or a <span className="text-pyro">Pyro</span>-infused <span className="text-anemo">Swirl</span> reaction, ATK is increased by {refinementVals[stats.weapon.refineIndex]}% for 12s.</span>,
  description: "A simple but heavy greatsword made of polished black Quartz with a golden gilt. It has an air of elegance and dignity about it.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    substatKey: "eleMas",
    sub: [31, 36, 42, 48, 54, 54, 60, 66, 73, 79, 79, 85, 91, 91, 97, 104, 104, 110, 116, 116, 122, 128, 128, 134, 141],
  },
  conditionals,
}
export default weapon