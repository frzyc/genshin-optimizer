import FerrousShadow from './Weapon_Ferrous_Shadow.png'
const refinementHpVals = [70, 75, 80, 85, 90]
const refinementVals = [30, 35, 40, 45, 50]
const weapon = {
  name: "Ferrous Shadow",
  weaponType: "claymore",
  img: FerrousShadow,
  rarity: 3,
  passiveName: "Unbending",
  passiveDescription: (refineIndex) => `When HP falls below ${refinementHpVals[refineIndex]}%, increases Charged Attack DMG by ${refinementVals[refineIndex]}% and Charged Attacks become harder to interrupt.`,
  description: "A replica of the famed sword of Arundolyn, the Lion of Light. Feel the power of a legendary hero as you hold this sword in your hand! Imagine yourself as the great warrior himself! Note: Daydreaming not recommended in live combat.",
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "hp_",
    sub: [7.7, 8.9, 10.4, 12, 13.5, 13.5, 15.1, 16.6, 18.2, 19.7, 19.7, 21.3, 22.8, 22.8, 24.4, 25.9, 25.9, 27.5, 29, 29, 30.5, 32.1, 32.1, 33.6, 35.2],
  },
  conditional: {
    type: "weapon",
    sourceKey: "FerrousShadow",
    maxStack: 1,
    stats: (refineIndex) => ({
      charged_dmg_: refinementVals[refineIndex]
    })
  }
}
export default weapon