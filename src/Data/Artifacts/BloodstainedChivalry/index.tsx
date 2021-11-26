import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Bloodstained Chivalry", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { physical_dmg_: 25 }
    },
    4: {
      document: [{
        conditional: {
          key: "4",
          name: "After defeating an opponent",
          stats: {
            charged_dmg_: 50,
            staminaDec_: 100,
          }
        }
      }]
    }
  }
}
export default artifact