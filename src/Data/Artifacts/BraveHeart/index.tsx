import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Brave Heart", rarity: [3, 4],
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
          key: "4",
          name: "Enemy with more than 50% HP",
          stats: { dmg_: 30, }
        }
      }]
    }
  }
}
export default artifact