import flower from './Item_Guardian\'s_Flower.png'
import plume from './Item_Guardian\'s_Sigil.png'
import sands from './Item_Guardian\'s_Clock.png'
import goblet from './Item_Guardian\'s_Vessel.png'
import circlet from './Item_Guardian\'s_Band.png'
let artifact = {
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
  sets: {
    2: {
      text: "Base DEF +30%",
      stats: { def_: 30 }
    },
    4: {
      text: "Increases Elemental RES by 30% for each element present in the party.",
      stats: {}
    }
  }
}
export default artifact