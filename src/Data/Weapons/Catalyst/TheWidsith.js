import TheWidsith from './Weapon_The_Widsith.png'
const refinementAtkVals = [60, 75, 90, 105, 120]
const refinementEleDmgVals = [48, 60, 72, 84, 96]
const refinementEleMasVals = [240, 300, 360, 420, 480]
const weapon = {
  name: "The Widsith",
  weaponType: "catalyst",
  img: TheWidsith,
  rarity: 4,
  passiveName: "Debut",
  passiveDescription: (refineIndex) => <span>When a character takes the field, they will gain a random theme song for 10s. This can only occur once every 30s. <br />Recitative: ATK is increased by {refinementAtkVals[refineIndex]}%. <br />Aria: Increases all Elemental DMG by {refinementEleDmgVals[refineIndex]}%. <br />Interlude: Elemental Mastery is increased by {refinementEleMasVals[refineIndex]}.</span>,//${refinementVals[refineIndex]}
  description: "A heavy notebook filled with musical scores. Though suffering from moth damage and heavy wear-and-tear, there is still much power to be found among the hand-written words within",
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    subStatKey: "critDMG_",
    sub: [12, 13.9, 16.4, 18.8, 21.2, 21.2, 23.6, 26.1, 28.5, 30.9, 30.9, 33.3, 35.7, 35.7, 38.2, 40.6, 40.6, 43, 45.4, 45.4, 47.9, 50.3, 50.3, 52.7, 55.1],
  },
  conditional: [{
    type: "weapon",
    condition: "Recitative",
    sourceKey: "TheWidsith",
    maxStack: 1,
    stats: (refineIndex) => ({
      atk_: refinementAtkVals[refineIndex]
    })
  }, {
    type: "weapon",
    condition: "Aria",
    sourceKey: "TheWidsith",
    maxStack: 1,
    stats: (refineIndex) => ({
      dmg_: refinementEleDmgVals[refineIndex]
    })
  }, {
    type: "weapon",
    condition: "Interlude",
    sourceKey: "TheWidsith",
    maxStack: 1,
    stats: (refineIndex) => ({
      eleMas: refinementEleMasVals[refineIndex]
    })
  }]
}
export default weapon