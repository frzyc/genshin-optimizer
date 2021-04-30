import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Bloodtainted_Greatsword.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  bft: {
    name: "Against Opponents affected by Pyro/Electro",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "Bloodtainted Greatsword",
  weaponType: "claymore",
  img,
  rarity: 3,
  passiveName: "Bane of Fire and Thunder",
  passiveDescription: stats => <span>Increases DMG dealt against opponents affected by <span className="text-pyro">Pyro</span> or <span className="text-electro">Electro</span> by {refinementVals[stats.weapon.refineIndex]}%.</span>,
  description: "A steel sword that is said to have been coated with dragon blood, rendering it invulnerable to damage. This effect is not extended to its wielder, however.",
  baseStats: {
    main: [38, 48, 61, 73, 86, 105, 117, 129, 140, 151, 171, 182, 193, 212, 223, 234, 253, 264, 274, 294, 304, 314, 334, 344, 354],
    substatKey: "eleMas",
    sub: [41, 47, 56, 64, 72, 72, 80, 89, 97, 105, 105, 113, 122, 122, 130, 138, 138, 146, 154, 154, 163, 171, 171, 179, 187],
  },
  conditionals
}
export default weapon