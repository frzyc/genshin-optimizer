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
  setEffects: {
    2: {
      text: <span><span className="text-electro">Electro RES</span> increased by 40%</span>,
      stats: { electro_res_: 40 }
    },
    4: {
      text: <span>Increases DMG against enemies affected by <span className="text-electro">Electro</span> by 35%.</span>,
      conditional: {
        type: "artifact",
        sourceKey: "Thundersoother_4",
        maxStack: 1,
        stats: {
          dmg_: 35,
        }
      }
    }
  }
}
export default artifact