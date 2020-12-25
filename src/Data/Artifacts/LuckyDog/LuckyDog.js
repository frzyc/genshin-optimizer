import flower from './Item_Lucky_Dog\'s_Clover.png'
import plume from './Item_Lucky_Dog\'s_Eagle_Feather.png'
import sands from './Item_Lucky_Dog\'s_Hourglass.png'
import goblet from './Item_Lucky_Dog\'s_Goblet.png'
import circlet from './Item_Lucky_Dog\'s_Silver_Circlet.png'
let artifact = {
  name: "Lucky Dog", rarity: [3],
  pieces: {
    flower: "Lucky Dog's Clover",
    plume: "Lucky Dog's Eagle Feather",
    sands: "Lucky Dog's Hourglass",
    goblet: "Lucky Dog's Goblet",
    circlet: "Lucky Dog's Silver Circlet"
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
      text: "DEF increased by 100.",
      stats: { def: 100 }
    },
    4: {
      text: "Picking up Mora restores 300 HP.",
      stats: {}
    }
  }
}
export default artifact