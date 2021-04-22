import { IConditionals } from '../../../Conditional/IConditional'
import WeaponSheet from '../../WeaponSheetInterace'
import img from './Weapon_Lion\'s_Roar.png'

const refinementVals = [20, 24, 28, 32, 36]
const conditionals : IConditionals = {
  bft: {
    name: "Against Opponents Affected by Pyro/Electro",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon : WeaponSheet = {
  name: "Lion’s Roar",
  weaponType: "sword",
  img,
  rarity: 4,
  passiveName: "Bane of Fire and Thunder",
  passiveDescription: stats => <span>Increases DMG against opponents affected by <span className="text-pyro">Pyro</span> or <span className="text-electro">Electro</span> by {refinementVals[stats.weapon.refineIndex]}%.</span>,
  description: "A sharp blade with extravagant carvings that somehow does not compromise on durability and sharpness. It roars like a lion as it cuts through the air.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  conditionals,
}
export default weapon