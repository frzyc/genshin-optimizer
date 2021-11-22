import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Gambler", rarity: [3, 4],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { skill_dmg_: 20 }
    },
    4: {
      document: [{
        conditional: {
          key: "4",
          name: "Defeating an enemy",
          stats: { skillCDRed_: 100 },
          fields: [{
            text: "CD",
            value: "15s"
          }]
        }
      }]
    }
  }
}
export default artifact