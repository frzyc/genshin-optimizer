import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import ColorText from '../../../Components/ColoredText'
const artifact: IArtifactSheet = {
  name: "Thundersoother", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { electro_res_: 40 }
    },
    4: {
      document: [{
        conditional: {
          key: "4",
          name: <span>Enemies affected by <ColorText color="electro">Electro</ColorText></span>,
          stats: { dmg_: 35 }
        }
      }]
    }
  }
}
export default artifact