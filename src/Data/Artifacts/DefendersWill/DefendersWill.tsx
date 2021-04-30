import flower from './Item_Guardian\'s_Flower.png'
import plume from './Item_Guardian\'s_Sigil.png'
import sands from './Item_Guardian\'s_Clock.png'
import goblet from './Item_Guardian\'s_Vessel.png'
import circlet from './Item_Guardian\'s_Band.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  anemo: {
    name: "Anemo in party",
    stats: { anemo_res_: 30 }//TODO: party conditional
  },
  geo: {
    name: "Geo in party",
    stats: { geo_res_: 30 }//TODO: party conditional
  },
  electro: {
    name: "Electro in party",
    stats: { electro_res_: 30 }//TODO: party conditional
  },
  hydro: {
    name: "Hydro in party",
    stats: { hydro_res_: 30 }//TODO: party conditional
  },
  pyro: {
    name: "Pyro in party",
    stats: { pyro_res_: 30 }//TODO: party conditional
  },
  cryo: {
    name: "Cryo in party",
    stats: { cryo_res_: 30 }//TODO: party conditional
  }
}
const artifact: IArtifactSheet = {
  name: "Defender's Will", rarity: [3, 4],
  pieces: {
    flower: "Guardian's Flower",
    plume: "Guardian's Sigil",
    sands: "Guardian's Clock",
    goblet: "Guardian's Vessel",
    circlet: "Guardian's Band"
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
      text: "Base DEF +30%",
      stats: { def_: 30 }
    },
    4: {
      text: "Increases Elemental RES by 30% for each element present in the party.",
      conditionals
    }
  }
}
export default artifact