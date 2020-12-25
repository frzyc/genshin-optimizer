import flower from './Item_Bloodstained_Flower_of_Iron.png'
import plume from './Item_Bloodstained_Black_Plume.png'
import sands from './Item_Bloodstained_Final_Hour.png'
import goblet from './Item_Bloodstained_Chevalier\'s_Goblet.png'
import circlet from './Item_Bloodstained_Iron_Mask.png'
let artifact = {
  name: "Bloodstained Chivalry", rarity: [4, 5], 
  pieces: {
    flower: "Bloodstained Flower of Iron",
    plume: "Bloodstained Black Plume",
    sands: "Bloodstained Final Hour",
    goblet: "Bloodstained Chevalier's Goblet",
    circlet: "Bloodstained Iron Mask"
  },
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  sets: {
    2: {
      text: "Physical DMG +25%",
      stats: { phy_dmg: 25 }
    },
    4: {
      text: "After defeating an opponent, increases Charged Attack DMG by 50%, and reduces its Stamina cost to 0 for 10s.",
      stats: {}
    }
  }
}
export default artifact