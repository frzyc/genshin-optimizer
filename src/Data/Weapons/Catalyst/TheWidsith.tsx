import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_The_Widsith.png'

const refinementAtkVals = [60, 75, 90, 105, 120]
const refinementEleDmgVals = [48, 60, 72, 84, 96]
const refinementEleMasVals = [240, 300, 360, 420, 480]
// TODO: multi-conditionals
const conditionals: IConditionals = {
  d: {
    name: "",
    states: {
      r: {
        name: "Recitative",
        stats: stats => ({
          atk_: refinementAtkVals[stats.weapon.refineIndex]
        })
      },
      a: {
        name: "Aria",
        maxStack: 1,
        stats: stats => ({
          dmg_: refinementEleDmgVals[stats.weapon.refineIndex]
        })
      },
      i: {
        name: "Interlude",
        stats: stats => ({
          eleMas: refinementEleMasVals[stats.weapon.refineIndex]
        })
      }
    }
  }
}
const weapon: IWeaponSheet = {
  name: "The Widsith",
  weaponType: "catalyst",
  img,
  rarity: 4,
  passiveName: "Debut",
  passiveDescription: stats => <span>When a character takes the field, they will gain a random theme song for 10s. This can only occur once every 30s. <br />Recitative: ATK is increased by {refinementAtkVals[stats.weapon.refineIndex]}%. <br />Aria: Increases all Elemental DMG by {refinementEleDmgVals[stats.weapon.refineIndex]}%. <br />Interlude: Elemental Mastery is increased by {refinementEleMasVals[stats.weapon.refineIndex]}.</span>,//${refinementVals[stats.weapon.refineIndex]}
  description: "A heavy notebook filled with musical scores. Though suffering from moth damage and heavy wear-and-tear, there is still much power to be found among the hand-written words within",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "critDMG_",
    sub: [12, 13.9, 16.4, 18.8, 21.2, 21.2, 23.6, 26.1, 28.5, 30.9, 30.9, 33.3, 35.7, 35.7, 38.2, 40.6, 40.6, 43, 45.4, 45.4, 47.9, 50.3, 50.3, 52.7, 55.1],
  },
  conditionals
}
export default weapon