
import flower from './Item_Summer_Night\'s_Bloom.png'
import plume from './Item_Summer_Night\'s_Finale.png'
import circlet from './Item_Summer_Night\'s_Mask.png'
import sands from './Item_Summer_Night\'s_Moment.png'
import goblet from './Item_Summer_Night\'s_Waterballoon.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  set4: {
    name: "With Shield",
    stats: {
      normal_dmg_: 40,
      charged_dmg_: 40
    }
  }
}
const artifact: IArtifactSheet = {
  name: "Retracing Bolide", rarity: [4, 5],
  pieces: {
    flower: "Summer Night's Bloom",
    plume: "Summer Night's Finale",
    sands: "Summer Night's Moment",
    goblet: "Summer Night's Waterballoon",
    circlet: "Summer Night's Mask"
  },
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  conditionals,
  setEffects: {
    2: {
      text: "Increases the effectiveness of shields by 35%",
      stats: { powShield_: 35 }
    },
    4: {
      text: "Gain an additional 40% Normal and Charged Attack DMG while under the protection of a shield.",
      conditional: conditionals.set4
    }
  }
}
export default artifact