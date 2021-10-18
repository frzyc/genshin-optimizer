import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'

const artifact: IArtifactSheet = {
  name: "Gladiator's Finale", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: { atk_: 18 }
    },
    4: {
      stats: stats => (stats.weaponType === "sword" || stats.weaponType === "polearm" || stats.weaponType === "claymore") ? { normal_dmg_: 35 } : {}
    }
  }
}
export default artifact