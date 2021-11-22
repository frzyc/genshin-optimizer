import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { st } from '../../Characters/SheetUtil'
const artifact: IArtifactSheet = {//Ocean Conqueror
  name: "Heart of Depth", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { hydro_dmg_: 15 }
    },
    4: {
      document: [{
        conditional: {
          key: "4",
          name: st("afterUse.skill"),
          stats: {
            normal_dmg_: 30,
            charged_dmg_: 30
          }
        }
      }]
    }
  }
}
export default artifact