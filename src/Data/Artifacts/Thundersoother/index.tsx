import flower from './Item_Thundersoother\'s_Heart.png'
import plume from './Item_Thundersoother\'s_Plume.png'
import sands from './Item_Hour_of_Soothing_Thunder.png'
import goblet from './Item_Thundersoother\'s_Goblet.png'
import circlet from './Item_Thundersoother\'s_Diadem.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
import ColorText from '../../../Components/ColoredText'
const conditionals: IConditionals = {
  4: {
    name: <span>Enemies affected by <ColorText color="electro">Electro</ColorText></span>,
    stats: { dmg_: 35 }
  }
}
const artifact: IArtifactSheet = {
  name: "Thundersoother", rarity: [4, 5],
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
      stats: { electro_res_: 40 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact