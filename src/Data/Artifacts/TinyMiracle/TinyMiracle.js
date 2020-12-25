import flower from './Item_Tiny_Miracle\'s_Flower.png'
import plume from './Item_Tiny_Miracle\'s_Feather.png'
import sands from './Item_Tiny_Miracle\'s_Hourglass.png'
import goblet from './Item_Tiny_Miracle\'s_Goblet.png'
import circlet from './Item_Tiny_Miracle\'s_Earrings.png'
let artifact = {
  name: "Tiny Miracle", rarity: [3, 4],
  pieces: {
    flower: "Tiny Miracle's Flower",
    plume: "Tiny Miracle's Feather",
    sands: "Tiny Miracle's Hourglass",
    goblet: "Tiny Miracle's Goblet",
    circlet: "Tiny Miracle's Earrings"
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
      text: "All Elemental RES increased by 20%",
      stats: {
        anemo_ele_res: 20,
        geo_ele_res: 20,
        electro_ele_res: 20,
        hydro_ele_res: 20,
        pyro_ele_res: 20,
        cryo_ele_res: 20,
      }
    },
    4: {
      text: "Incoming elemental DMG increases corresponding Elemental RES by 30% for 10s. Can only occur once every 10s.",
      stats: {}
    }
  }
}
export default artifact