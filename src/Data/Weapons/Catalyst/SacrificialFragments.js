import SacrificialFragments from './Weapon_Sacrificial_Fragments.png'
const refinementVals = [40, 50, 60, 70, 80]
const refinementCdVals = [30, 26, 22, 19, 16]
const weapon = {
  name: "Sacrificial Fragments",
  weaponType: "catalyst",
  img: SacrificialFragments,
  rarity: 4,
  passiveName: "Composed",
  passiveDescription: (refineIndex) => `After dealing damage to an enemy with an Elemental Skill, the skill has a ${refinementVals[refineIndex]}% chance to end its own CD. Can only occur once every ${refinementCdVals[refineIndex]}s`,
  description: "A weathered script, the text of which is no longer legible. A cursed item eroded by the winds of time.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    subStatKey: "eleMas",
    sub: [48, 56, 65, 75, 85, 85, 95, 104, 114, 124, 124, 133, 143, 143, 153, 162, 162, 172, 182, 182, 191, 201, 201, 211, 221],
  },
  conditional: {
    type: "weapon",
    sourceKey: "SacrificialFragments",
    maxStack: 1,
    stats: () => ({
      cdRed_: 100
    })
  }
}
export default weapon