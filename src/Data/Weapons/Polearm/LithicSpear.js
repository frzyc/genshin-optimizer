const refinementVals = [20, 25, 30, 35, 40]
const weapon = {
  name: "Lithic Spear",
  weaponType: "polearm",
  rarity: 4,
  passiveName: "Lithic Axiom - Subjugating Evil",
  passiveDescription: (refineIndex) => `Normal Attack hits have a 20% chance of causing the next Charged Attack performed in the following 10s to deal ${refinementVals[refineIndex]}% increased DMG.`,
  description: "A spear forged from the rocks of the Guyun Stone Forest. Its hardness knows no equal.",
  baseStats: {
    main: [42, NaN, NaN, NaN, 109, 135, NaN, NaN, NaN, 205, 231, NaN, 266, 292, NaN, 327, 353, NaN, 388, 414, NaN, 449, 475, NaN, 510],
    subStatKey: "phy_dmg_bonus",
    sub: [9, NaN, NaN, NaN, 15.9, 15.9, NaN, NaN, NaN, 23.2, 23.2, NaN, 26.8, 26.8, NaN, 30.4, 30.4, NaN, 34.1, 34.1, NaN, 37.7, 37.7, NaN, 41.3],
  },
  conditional: {
    type: "weapon",
    sourceKey: "LithicSpear",
    maxStack: 1,
    stats: (refineIndex) => ({
      char_atk_dmg_bonus: refinementVals[refineIndex]
    })
  }
}
export default weapon