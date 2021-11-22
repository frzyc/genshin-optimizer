import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Berserker", rarity: [3, 4],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { critRate_: 12 }
    },
    4: {
      document: [{
        conditional: {
          key: "4",
          name: "HP below 70%",
          stats: { critRate_: 24 }
        }
      }]
    }
  }
}
export default artifact