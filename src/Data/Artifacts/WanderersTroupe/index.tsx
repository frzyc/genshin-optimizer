import flower from './Item_Troupe\'s_Dawnlight.png'
import plume from './Item_Bard\'s_Arrow_Feather.png'
import sands from './Item_Concert\'s_Final_Hour.png'
import goblet from './Item_Wanderer\'s_String_Kettle.png'
import circlet from './Item_Conductor\'s_Top_Hat.png'
import { IArtifactSheet } from '../../../Types/artifact'

const artifact: IArtifactSheet = {
  name: "Wanderer's Troupe", rarity: [4, 5],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      stats: {
        eleMas: 80
      }
    },
    4: {
      stats: stats => (stats.weaponType === "catalyst" || stats.weaponType === "bow") ? { charged_dmg_: 35 } : {}
    }
  }
}
export default artifact