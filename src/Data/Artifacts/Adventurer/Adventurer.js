import flower from './Item_Adventurer\'s_Flower.png'
import plume from './Item_Adventurer\'s_Tail_Feather.png'
import sands from './Item_Adventurer\'s_Pocket_Watch.png'
import goblet from './Item_Adventurer\'s_Golden_Goblet.png'
import circlet from './Item_Adventurer\'s_Bandana.png'
import DisplayPercent from '../../../Components/DisplayPercent'
let artifact = {
  name: "Adventurer", rarity: [3],
  pieces: {
    flower: "Adventurer's Flower",
    plume: "Adventurer's Tail Feather",
    sands: "Adventurer's Pocket Watch",
    goblet: "Adventurer's Golden Goblet",
    circlet: "Adventurer's Bandana"
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
      text: "Max HP increased by 1,000.",
      stats: { hp: 1000 }
    },
    4: {
      text: (charFinalStats) => <span>Opening chest regenerates 30% Max HP{DisplayPercent(30, charFinalStats, "finalHP")} over 5s.</span>,
    }
  }
}
export default artifact

