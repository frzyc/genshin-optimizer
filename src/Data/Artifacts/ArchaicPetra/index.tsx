import flower from './Item_Flower_of_Creviced_Cliff.png'
import plume from './Item_Feather_of_Jagged_Peaks.png'
import sands from './Item_Sundial_of_Enduring_Jade.png'
import goblet from './Item_Goblet_of_Chiseled_Crag.png'
import circlet from './Item_Mask_of_Solitude_Basalt.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {//TODO: all party conditional
  4: {
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
      stats: { geo_dmg_: 15 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact