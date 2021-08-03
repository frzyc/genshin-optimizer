
import flower from './Item_Summer_Night\'s_Bloom.png'
import plume from './Item_Summer_Night\'s_Finale.png'
import circlet from './Item_Summer_Night\'s_Mask.png'
import sands from './Item_Summer_Night\'s_Moment.png'
import goblet from './Item_Summer_Night\'s_Waterballoon.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  4: {
    name: "With Shield",
    stats: {
      normal_dmg_: 40,
      charged_dmg_: 40
    }
  }
}
const artifact: IArtifactSheet = {
  name: "Retracing Bolide", rarity: [4, 5],
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
      stats: { powShield_: 35 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact