import flower from './Item_Medal_of_the_Brave.png'
import plume from './Item_Prospect_of_the_Brave.png'
import sands from './Item_Fortitude_of_the_Brave.png'
import goblet from './Item_Outset_of_the_Brave.png'
import circlet from './Item_Crown_of_the_Brave.png'
let artifact = {
  name: "Brave Heart", rarity: [3, 4],
  pieces: {
    flower: "Medal of the Brave",
    plume: "Prospect of the Brave",
    sands: "Fortitude of the Brave",
    goblet: "Outset of the Brave",
    circlet: "Crown of the Brave"
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
      text: "2-piece Set Bonus: ATK +18%",
      stats: { atk_: 18 }
    },
    4: {
      text: "Increases DMG by 30% against enemies with more than 50% HP.",
      conditional: {
        type: "artifact",
        sourceKey: "BraveHeart_4",
        maxStack: 1,
        stats: {
          dmg_: 30,
        }
      }
    }
  }
}
export default artifact