import flower from './Item_Exile\'s_Flower.png'
import plume from './Item_Exile\'s_Feather.png'
import sands from './Item_Exile\'s_Pocket_Watch.png'
import goblet from './Item_Exile\'s_Goblet.png'
import circlet from './Item_Exile\'s_Circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "The Exile", rarity: [3, 4],
    icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
            stats: { enerRech_: 20 }
    },
    4: {
          }
  }
}
export default artifact