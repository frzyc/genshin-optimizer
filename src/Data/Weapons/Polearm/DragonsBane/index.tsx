import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_Dragon\'s_Bane.png'

const refinementVals = [20, 24, 28, 32, 36]
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
  name: "Dragon’s Bane",
  weaponType: "polearm",
  img,
  rarity: 4,
  passiveName: "Bane of Flame and Water",
  passiveDescription: stats => <span>Increases DMG against opponents affected by <span className="text-hydro">Hydro</span> or <span className="text-pyro">Pyro</span> by {refinementVals[stats.weapon.refineIndex]}%.</span>,
  description: "A polearm decorated with an entwining golden dragon. Light and sharp, this weapon may very well kill dragons with ease.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    substatKey: "eleMas",
    sub: [48, 56, 65, 75, 85, 85, 95, 104, 114, 124, 124, 133, 143, 143, 153, 162, 162, 172, 182, 182, 191, 201, 201, 211, 221],
  },
  conditionals,
}
export default weapon