import SacrificialSword from './Weapon_Sacrificial_Sword.png'
const refinementVals = [40, 50, 60, 70, 80]
const refinementcdVals = [30, 26, 22, 19, 16]
const weapon = {
  name: "Sacrificial Sword",
  weaponType: "sword",
  img: SacrificialSword,
  rarity: 4,
  passiveName: "Composed",
  passiveDescription: (refineIndex) => `After damaging an opponent with an Elemental Skill, the skill has a ${refinementVals[refineIndex]}% chance to end its own CD. Can only occur once every ${refinementcdVals[refineIndex]}s.`,
  description: "A ceremonial sword that has become petrified over time. The trinkets on it are still visible. It grants the wielder the power to withstand the winds of time.",
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    subStatKey: "enerRech_",
    sub: [13.3, 15.5, 18.2, 20.9, 23.6, 23.6, 26.3, 28.9, 31.6, 34.3, 34.3, 37, 39.7, 39.7, 42.4, 45.1, 45.1, 47.8, 50.5, 50.5, 53.2, 55.9, 55.9, 58.6, 61.3],
  },
  conditional: {
    type: "weapon",
    sourceKey: "SacrificialSword",
    maxStack: 1,
    stats: () => ({
      cdRed_: 100
    })
  }
}
export default weapon