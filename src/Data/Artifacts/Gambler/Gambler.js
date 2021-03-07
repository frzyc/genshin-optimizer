import flower from './Item_Gambler\'s_Brooch.png'
import plume from './Item_Gambler\'s_Feather_Accessory.png'
import sands from './Item_Gambler\'s_Pocket_Watch.png'
import goblet from './Item_Gambler\'s_Dice_Cup.png'
import circlet from './Item_Gambler\'s_Earrings.png'
let artifact = {
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
  setEffects: {
    2: {
      text: "Elemental Skill DMG increased by 20%",
      stats: { skill_dmg_: 20 }
    },
    4: {
      text: "Defeating an enemy has 100% chance to remove Elemental Skill CD. Can only occur once every 15s.",
      conditional: {
        type: "artifact",
        sourceKey: "Gambler_4",
        maxStack: 1,
        stats: {
          skillCDRed_: 100,
        }
      }
    }
  }
}
export default artifact