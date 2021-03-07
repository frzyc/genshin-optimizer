import AmosBow from './Weapon_Amos\'_Bow.png'
const refinementVals = [12, 15, 18, 21, 24]
const refinementDmgVals = [8, 10, 12, 14, 16]
const weapon = {
  name: "Amos’ Bow",
  weaponType: "bow",
  img: AmosBow,
  rarity: 5,
  passiveName: "Strong-Willed",
  passiveDescription: (refineIndex) => `Increases Normal Attack and Charged Attack DMG by ${refinementVals[refineIndex]}%. Normal and Charged Attack DMG from arrows shot by a further ${refinementDmgVals[refineIndex]}% for every 0.1s that the arrow is in flight, up to 0.5s.`,
  description: "An extremely ancient bow that has retained its power despite its original master being long gone. It draws power from everyone and everything in the world, and the further away you are from that which your heart desires the more",
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    subStatKey: "atk_",
    sub: [10.8, 12.5, 14.7, 16.9, 19.1, 19.1, 21.3, 23.4, 25.6, 27.8, 27.8, 30, 32.2, 32.2, 34.4, 36.5, 36.5, 38.7, 40.9, 40.9, 43.1, 45.3, 45.3, 47.4, 49.6],
  },
  stats: (refineIndex) => ({
    normal_dmg_: refinementVals[refineIndex],
    charged_dmg_: refinementVals[refineIndex]
  }),
  conditional: {
    type: "weapon",
    sourceKey: "AmosBow",
    maxStack: 5,
    stats: (refineIndex) => ({
      normal_dmg_: refinementDmgVals[refineIndex],
      charged_dmg_: refinementDmgVals[refineIndex]
    })
  }
}
export default weapon