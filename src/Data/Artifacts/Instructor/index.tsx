import flower from './Item_Instructor\'s_Brooch.png'
import plume from './Item_Instructor\'s_Feather_Accessory.png'
import sands from './Item_Instructor\'s_Pocket_Watch.png'
import goblet from './Item_Instructor\'s_Tea_Cup.png'
import circlet from './Item_Instructor\'s_Cap.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  4: {
    name: "After using Elemental Skill",
    stats: { eleMas: 120 }//TODO: party buff
  }
}
const artifact: IArtifactSheet = {
  name: "Instructor", rarity: [3, 4],
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
      stats: { eleMas: 80 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact