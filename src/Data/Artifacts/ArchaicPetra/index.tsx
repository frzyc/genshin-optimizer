import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
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