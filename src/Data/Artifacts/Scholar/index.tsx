import flower from './Item_Scholar\'s_Bookmark.png'
import plume from './Item_Scholar\'s_Quill_Pen.png'
import sands from './Item_Scholar\'s_Clock.png'
import goblet from './Item_Scholar\'s_Ink_Cup.png'
import circlet from './Item_Scholar\'s_Lens.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Scholar", rarity: [3, 4],
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