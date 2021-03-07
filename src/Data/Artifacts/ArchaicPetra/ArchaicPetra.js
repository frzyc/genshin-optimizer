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
  setEffects: {
    2: {
      text: <span>Gain a 15% <span className="text-geo">Geo DMG Bonus</span></span>,
      stats: { geo_dmg_: 15 }
    },
    4: {
      text: "Upon obtaining an Elemental Shard created through a Crystallize Reaction, all party members gain 35% DMG to that particular element for 10s. Only one form of Elemental DMG can be gained in this manner at any one time.",
      conditional: [{//TODO all party conditional
        type: "artifact",
        condition: "Pyro",
        sourceKey: "ArchaicPetra_4",
        maxStack: 1,
        stats: {
          pyro_dmg_: 35,
        }
      }, {
        type: "artifact",
        condition: "Electro",
        sourceKey: "ArchaicPetra_4",
        maxStack: 1,
        stats: {
          electro_dmg_: 35,
        }
      }, {
        type: "artifact",
        condition: "Hydro",
        sourceKey: "ArchaicPetra_4",
        maxStack: 1,
        stats: {
          hydro_dmg_: 35,
        }
      }, {
        type: "artifact",
        condition: "Cryo",
        sourceKey: "ArchaicPetra_4",
        maxStack: 1,
        stats: {
          cryo_dmg_: 35,
        }
      }]
    }
  }
}
export default artifact