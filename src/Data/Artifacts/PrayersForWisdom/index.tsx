import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Prayers for Wisdom", rarity: [3, 4],
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