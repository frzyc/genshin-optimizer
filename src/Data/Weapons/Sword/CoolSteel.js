import CoolSteel from './Weapon_Cool_Steel.png'
const refinementVals = [12, 15, 18, 21, 24]
const weapon = {
  name: "Cool Steel",
  weaponType: "sword",
  img: CoolSteel,
  rarity: 3,
  passiveName: "Bane of Water and Ice",
  passiveDescription: (refineIndex) => <span>Increases DMG against opponents affected by <span className="text-hydro">Hydro</span> or <span className="text-cryo">Cryo</span> by {refinementVals[refineIndex]}%.`,
  description: "A reliable steel-forged weapon that serves as a testament to the great adventures of its old master.</span>,
  baseStats: {
    main: [39, 50, 65, 79, 94, 113, 127, 141, 155, 169, 189, 202, 216, 236, 249, 263, 282, 296, 309, 329, 342, 355, 375, 388, 401],
    subStatKey: "atk_",
    sub: [7.7, 8.9, 10.4, 12, 13.5, 13.5, 15.1, 16.6, 18.2, 19.7, 19.7, 21.3, 22.8, 22.8, 24.4, 25.9, 25.9, 27.5, 29, 29, 30.5, 32.1, 32.1, 33.6, 35.2],
  },
  conditional: {
    type: "weapon",
    sourceKey: "CoolSteel",
    maxStack: 1,
    stats: (refineIndex) => ({
      dmg_: refinementVals[refineIndex]
    })
  }
}
export default weapon