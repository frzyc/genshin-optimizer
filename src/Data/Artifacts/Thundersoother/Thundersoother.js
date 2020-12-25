import flower from './Item_Thundersoother\'s_Heart.png'
import plume from './Item_Thundersoother\'s_Plume.png'
import sands from './Item_Hour_of_Soothing_Thunder.png'
import goblet from './Item_Thundersoother\'s_Goblet.png'
import circlet from './Item_Thundersoother\'s_Diadem.png'
let artifact = {
  name: "Thundersoother", rarity: [4, 5],
  pieces: {
    flower: "Thundersoother's Heart",
    plume: "Thundersoother's Plume",
    sands: "Hour of Soothing Thunder",
    goblet: "Thundersoother's Goblet",
    circlet: "Thundersoother's Diadem"
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
      text: "Electro RES increased by 40%",
      stats: { electro_ele_Res: 40 }
    },
    4: {
      text: "Increases DMG against enemies affected by Electro by 35%.",
      stats: {}
    }
  }
}
export default artifact