import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Husk of Opulent Dreams", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { def_: 30 }
    },
    4: {
      document: [{
        conditional: {
          key: "4",
          name: "Curiosity",
          maxStack: 4,
          stats: { def_: 6, geo_dmg_: 6 },
        }
      }]
    }
  }
}
export default artifact