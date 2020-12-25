import flower from './Item_Lavawalker\'s_Resolution.png'
import plume from './Item_Lavawalker\'s_Salvation.png'
import sands from './Item_Lavawalker\'s_Torment.png'
import goblet from './Item_Lavawalker\'s_Epiphany.png'
import circlet from './Item_Lavawalker\'s_Wisdom.png'
let artifact = {
  name: "Lavawalker", rarity: [4, 5],
  pieces: {
    flower: "Lavawalker's Resolution",
    plume: "Lavawalker's Salvation",
    sands: "Lavawalker's Torment",
    goblet: "Lavawalker's Epiphany",
    circlet: "Lavawalker's Wisdom"
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
      text: "Pyro RES increased by 40%",
      stats: { pyro_ele_res: 40 }
    },
    4: {
      text: "Increases DMG against enemies that are Burning or affected by Pyro by 35%.",
      stats: {}
    }
  }
}
export default artifact