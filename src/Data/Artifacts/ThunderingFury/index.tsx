import flower from './Item_Thunderbird\'s_Mercy.png'
import plume from './Item_Survivor_of_Catastrophe.png'
import sands from './Item_Hourglass_of_Thunder.png'
import goblet from './Item_Omen_of_Thunderstorm.png'
import circlet from './Item_Thunder_Summoner\'s_Crown.png'
import { IArtifactSheet } from '../../../Types/artifact'
const artifact: IArtifactSheet = {
  name: "Thundering Fury", rarity: [4, 5],   icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
            stats: { electro_dmg_: 15 }
    },
    4: {
            stats: {
        overloaded_dmg_: 40,
        electrocharged_dmg_: 40,
        superconduct_dmg_: 40
      }
    }
  }
}
export default artifact