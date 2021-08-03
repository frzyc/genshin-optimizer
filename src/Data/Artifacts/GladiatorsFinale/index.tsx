import flower from './Item_Gladiator\'s_Nostalgia.png'
import plume from './Item_Gladiator\'s_Destiny.png'
import sands from './Item_Gladiator\'s_Longing.png'
import goblet from './Item_Gladiator\'s_Intoxication.png'
import circlet from './Item_Gladiator\'s_Triumphus.png'
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