import circlet from './Item_Tiara_of_Flame.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Prayers for Illumination", rarity: [3, 4],
  icons: {
    circlet
  },
  setEffects: {
    1: {
      stats: {}//TODO element affect reduction stat
    }
  }
}
export default artifact