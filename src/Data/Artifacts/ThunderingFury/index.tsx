import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
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