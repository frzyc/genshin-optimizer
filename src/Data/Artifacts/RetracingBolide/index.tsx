
import flower from './flower.png'
import plume from './plume.png'
import circlet from './circlet.png'
import sands from './sands.png'
import goblet from './goblet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Retracing Bolide", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
    setEffects: {
    2: {
      stats: { shield_: 35 }
    },
    4: {
      document: [{
        conditional: {
          key:"4",
          name: "With Shield",
          stats: {
            normal_dmg_: 40,
            charged_dmg_: 40
          }
        }
      }]
    }
  }
}
export default artifact