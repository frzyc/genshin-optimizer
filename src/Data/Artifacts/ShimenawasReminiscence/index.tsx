import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Shimenawa's Reminiscence", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
    setEffects: {
    2: {
      stats: { atk_: 18 }
    },
    4: {
      document: [{
        conditional: {
          key:"4",
          name: "After using 15 energy",
          stats: {
            normal_dmg_: 50,
            charged_dmg_: 50,
            plunging_dmg_: 50,
          }
        }
      }]
    }
  }
}
export default artifact