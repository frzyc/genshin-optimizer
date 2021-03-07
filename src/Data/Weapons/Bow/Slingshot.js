import Slingshot from './Weapon_Slingshot.png'
const refinementVals = [36, 42, 48, 54, 60]
const weapon = {
  name: "Slingshot",
  weaponType: "bow",
  img: Slingshot,
  rarity: 3,
  passiveName: "Slingshot",
  passiveDescription: (refineIndex) => `If a Normal or Charged Attack hits a target within 0.3s of being fired, increases DMG by ${refinementVals[refineIndex]}%. Otherwise, decreases DMG by 10%.`,
  description: "A bow, despite the name. After countless experiments and improvements to the design, the creator of the ultimate Slingshot found himself to have made what was actually a bow.",
  baseStats: {
    main: [38, 48, 61, 73, 86, 105, 117, 129, 140, 151, 171, 182, 193, 212, 223, 234, 253, 264, 274, 294, 304, 314, 334, 344, 354],
    subStatKey: "critRate_",
    sub: [6.8, 7.9, 9.3, 10.6, 12, 12, 13.4, 14.8, 16.1, 17.5, 17.5, 18.9, 20.3, 20.3, 21.6, 23, 23, 24.4, 25.7, 25.7, 27.1, 28.5, 28.5, 29.9, 31.2],
  },
  stats: () => ({
    dmg_: -10
  }),
  conditional: {
    type: "weapon",
    sourceKey: "Slingshot",
    maxStack: 1,
    stats: (refineIndex) => ({
      dmg_: refinementVals[refineIndex] + 10//+10 to neutralize the -10
    })
  }
}
export default weapon