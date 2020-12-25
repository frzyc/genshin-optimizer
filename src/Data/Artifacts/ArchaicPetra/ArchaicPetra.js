import flower from './Item_Flower_of_Creviced_Cliff.png'
import plume from './Item_Feather_of_Jagged_Peaks.png'
import sands from './Item_Sundial_of_Enduring_Jade.png'
import goblet from './Item_Goblet_of_Chiseled_Crag.png'
import circlet from './Item_Mask_of_Solitude_Basalt.png'
let artifact = {
  name: "Archaic Petra", rarity: [4, 5],
  pieces: {
    flower: "Flower of Creviced Cliff",
    plume: "Feather of Jagged Peaks",
    sands: "Sundial of Enduring Jade",
    goblet: "Goblet of Chiseled Crag",
    circlet: "Mask of Solitude Basalt"
  },
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  sets: {
    2: {
      text: "	Gain a 15% Geo DMG Bonus",
      stats: { geo_ele_dmg: 15 }
    },
    4: {
      text: "Upon obtaining a crystal created through a Geo Elemental Reaction, all party members gain 35% RES to that particular element for 10s. Only one form of Elemental RES can be gained in this manner at any one time. Upon obtaining a crystal created through a Geo Elemental Reaction, all party members gain 35% RES to that particular element for 10s. Only one form of Elemental RES can be gained in this manner at any one time.",
      stats: {}
    }
  }
}
export default artifact