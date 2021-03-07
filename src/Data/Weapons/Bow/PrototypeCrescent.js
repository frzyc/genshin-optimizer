import PrototypeCrescent from './Weapon_Prototype_Crescent.png'
const refinementVals = [36, 45, 54, 63, 72]
const weapon = {
  name: "Prototype Crescent",
  weaponType: "bow",
  img: PrototypeCrescent,
  rarity: 4,
  passiveName: "Unreturning",
  passiveDescription: (refineIndex) => `Charged Attack hits on weak points increase Movement SPD by 10% and ATK by ${refinementVals[refineIndex]}% for 10s.`,
  description: "A prototype longbow discovered in the Blackcliff Forge. The arrow fired from this bow glimmers like a ray of moonlight.",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "atk_",
    sub: [9, 10.5, 12.3, 14.1, 15.9, 15.9, 17.7, 19.5, 21.4, 23.2, 23.2, 25, 26.8, 26.8, 28.6, 30.4, 30.4, 32.3, 34.1, 34.1, 35.9, 37.7, 37.7, 39.5, 41.3],
  },
  conditional: {
    type: "weapon",
    sourceKey: "PrototypeCrescent",
    maxStack: 1,
    stats: (refineIndex) => ({
      moveSPD_: 10,
      atk_: refinementVals[refineIndex]
    })
  }
}
export default weapon