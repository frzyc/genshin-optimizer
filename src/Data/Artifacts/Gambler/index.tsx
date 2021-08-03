import flower from './Item_Gambler\'s_Brooch.png'
import plume from './Item_Gambler\'s_Feather_Accessory.png'
import sands from './Item_Gambler\'s_Pocket_Watch.png'
import goblet from './Item_Gambler\'s_Dice_Cup.png'
import circlet from './Item_Gambler\'s_Earrings.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  4: {
    name: "Defeating an enemy",
    stats: { skillCDRed_: 100 },
    fields: [{
      text: "CD",
      value: "15s"
    }]
  }
}
const artifact: IArtifactSheet = {
  name: "Gambler", rarity: [3, 4],
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
      stats: { skill_dmg_: 20 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact