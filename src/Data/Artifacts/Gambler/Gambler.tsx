import flower from './Item_Gambler\'s_Brooch.png'
import plume from './Item_Gambler\'s_Feather_Accessory.png'
import sands from './Item_Gambler\'s_Pocket_Watch.png'
import goblet from './Item_Gambler\'s_Dice_Cup.png'
import circlet from './Item_Gambler\'s_Earrings.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  set4: {
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
  pieces: {
    flower: "Gambler's Brooch",
    plume: "Gambler's Feathered Accessory",
    sands: "Gambler's Pocket Watch",
    goblet: "Gambler's Dice Cup",
    circlet: "Gambler's Earrings"
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
      text: "Elemental Skill DMG increased by 20%",
      stats: { skill_dmg_: 20 }
    },
    4: {
      text: "Defeating an enemy has 100% chance to remove Elemental Skill CD. Can only occur once every 15s.",
      conditional: conditionals.set4
    }
  }
}
export default artifact