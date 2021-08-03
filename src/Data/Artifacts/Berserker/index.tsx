import flower from './Item_Berserker\'s_Rose.png'
import plume from './Item_Berserker\'s_Indigo_Feather.png'
import sands from './Item_Berserker\'s_Timepiece.png'
import goblet from './Item_Berserker\'s_Bone_Goblet.png'
import circlet from './Item_Berserker\'s_Battle_Mask.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  4: {
    name: "HP below 70%",
    stats: { critRate_: 24 }
  }
}
const artifact: IArtifactSheet = {
  name: "Berserker", rarity: [3, 4],
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
      stats: { critRate_: 12 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact