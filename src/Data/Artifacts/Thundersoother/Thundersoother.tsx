import flower from './Item_Thundersoother\'s_Heart.png'
import plume from './Item_Thundersoother\'s_Plume.png'
import sands from './Item_Hour_of_Soothing_Thunder.png'
import goblet from './Item_Thundersoother\'s_Goblet.png'
import circlet from './Item_Thundersoother\'s_Diadem.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  set4: {
    name: <span>Enemies affected by <span className="text-electro">Electro</span></span>,
    stats: { dmg_: 35 }
  }
}
const artifact: IArtifactSheet = {
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
  conditionals,
  setEffects: {
    2: {
      text: <span><span className="text-electro">Electro RES</span> increased by 40%</span>,
      stats: { electro_res_: 40 }
    },
    4: {
      text: <span>Increases DMG against enemies affected by <span className="text-electro">Electro</span> by 35%.</span>,
      conditional: conditionals.set4
    }
  }
}
export default artifact