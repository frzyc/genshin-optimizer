import flower from './Item_Lucky_Dog\'s_Clover.png'
import plume from './Item_Lucky_Dog\'s_Eagle_Feather.png'
import sands from './Item_Lucky_Dog\'s_Hourglass.png'
import goblet from './Item_Lucky_Dog\'s_Goblet.png'
import circlet from './Item_Lucky_Dog\'s_Silver_Circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Lucky Dog", rarity: [3],
    icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
            stats: { def: 100 }
    },
    4: {
          }
  }
}
export default artifact