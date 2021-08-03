import flower from './Item_Martial_Artist\'s_Red_Flower.png'
import plume from './Item_Martial_Artist\'s_Feather_Accessory.png'
import sands from './Item_Martial_Artist\'s_Water_Hourglass.png'
import goblet from './Item_Martial_Artist\'s_Wine_Cup.png'
import circlet from './Item_Martial_Artist\'s_Bandana.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  4: {
    name: "After using Elemental Skill",
    stats: {
      normal_dmg_: 25,
      charged_dmg_: 25
    }
  }
}
const artifact: IArtifactSheet = {
  name: "Martial Artist", rarity: [3, 4],
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
      stats: {
        normal_dmg_: 15,
        charged_dmg_: 15
      }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact