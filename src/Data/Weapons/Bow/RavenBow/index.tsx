import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Raven_Bow.png'

const refinementVals = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  bfw: {
    name: "Against Opponents Affected by Hydro/Pyro",
    maxStack: 1,
    stats: stats => ({
      dmg_: refinementVals[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  name: "Raven Bow",
  weaponType: "bow",
  img,
  rarity: 3,
  passiveName: "Bane of Flame and Water",
  passiveDescription: stats => <span>Increases DMG against opponents affected by <span className="text-hydro">Hydro</span> or <span className="text-pyro">Pyro</span> by {refinementVals[stats.weapon.refineIndex]}%.</span>,
  description: "Ravens are known to be the ferrymen of the dead. This bow's limb is decorated with raven feathers, which forebode the imminent death of its target.",
  baseStats: {
    main: [40, 53, 69, 86, 102, 121, 138, 154, 171, 187, 207, 223, 239, 259, 275, 292, 311, 327, 344, 363, 380, 396, 415, 432, 448],
    substatKey: "eleMas",
    sub: [20, 24, 28, 32, 36, 36, 40, 44, 48, 53, 53, 57, 61, 61, 65, 69, 69, 73, 77, 77, 81, 85, 85, 90, 94],
  },
  conditionals
}
export default weapon