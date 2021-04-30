import circlet from './Item_Tiara_of_Thunder.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Prayers for Wisdom", rarity: [3, 4],
  pieces: {
    circlet: "Tiara of Thunder"
  },
  icons: {
    circlet
  },
  setEffects: {
    1: {
      text: <span>Affected by <span className="text-electro">Electro</span> for 40% less time.</span>,
      stats: {}//TODO element affect reduction stat
    }
  }
}

export default artifact