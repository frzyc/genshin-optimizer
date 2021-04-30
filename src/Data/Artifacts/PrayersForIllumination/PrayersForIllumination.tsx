import circlet from './Item_Tiara_of_Flame.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Prayers for Illumination", rarity: [3, 4],
  pieces: {
    circlet: "Tiara of Flame"
  },
  icons: {
    circlet
  },
  setEffects: {
    1: {
      text: <span>Affected by <span className="text-pyro">Pyro</span> for 40% less time.</span>,
      stats: {}//TODO element affect reduction stat
    }
  }
}
export default artifact