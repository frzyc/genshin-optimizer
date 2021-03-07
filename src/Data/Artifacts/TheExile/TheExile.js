import flower from './Item_Exile\'s_Flower.png'
import plume from './Item_Exile\'s_Feather.png'
import sands from './Item_Exile\'s_Pocket_Watch.png'
import goblet from './Item_Exile\'s_Goblet.png'
import circlet from './Item_Exile\'s_Circlet.png'
let artifact = {
  name: "The Exile", rarity: [3, 4],
  pieces: {
    flower: "Exile's Flower",
    plume: "Exile's Feather",
    sands: "Exile's Pocket Watch",
    goblet: "Exile's Goblet",
    circlet: "Exile's Circlet"
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
      text: "Energy Recharge +20%",
      stats: { enerRech_: 20 }
    },
    4: {
      text: "Using an Elemental Burst regenerates 2 Energy for other party members every 2s for 6s. This effect cannot stack.",
    }
  }
}
export default artifact