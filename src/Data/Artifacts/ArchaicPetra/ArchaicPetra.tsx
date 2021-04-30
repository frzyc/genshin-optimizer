import flower from './Item_Flower_of_Creviced_Cliff.png'
import plume from './Item_Feather_of_Jagged_Peaks.png'
import sands from './Item_Sundial_of_Enduring_Jade.png'
import goblet from './Item_Goblet_of_Chiseled_Crag.png'
import circlet from './Item_Mask_of_Solitude_Basalt.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {//TODO: all party conditional
  set4: {
    name: "Obtaining Crystallize Shard",
    states: {
      pyro: {
        name: "Pyro",
        stats: { pyro_dmg_: 35 }
      },
      electro: {
        name: "Electro",
        stats: { electro_dmg_: 35 }
      },
      hydro: {
        name: "Hydro",
        stats: { hydro_dmg_: 35 }
      },
      cryo: {
        name: "Cryo",
        stats: { cryo_dmg_: 35 }
      }
    }
  }
}
const artifact: IArtifactSheet = {
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
  conditionals,
  setEffects: {
    2: {
      text: <span>Gain a 15% <span className="text-geo">Geo DMG Bonus</span></span>,
      stats: { geo_dmg_: 15 }
    },
    4: {
      text: <span>Upon obtaining an Elemental Shard created through a <span className="text-crystallize">Crystallize</span> Reaction, all party members gain 35% DMG to that particular element for 10s. Only one form of Elemental DMG can be gained in this manner at any one time.</span>,
      conditional: conditionals.set4
    }
  }
}
export default artifact