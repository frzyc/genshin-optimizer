import flower from './Item_Traveling_Doctor\'s_Silver_Lotus.png'
import plume from './Item_Traveling_Doctor\'s_Owl_Feather.png'
import sands from './Item_Traveling_Doctor\'s_Pocket_Watch.png'
import goblet from './Item_Traveling_Doctor\'s_Medicine_Pot.png'
import circlet from './Item_Traveling_Doctor\'s_Handkerchief.png'
import WeaponPercent from '../../../Components/WeaponPercent'
let artifact = {
  name: "Traveling Doctor", rarity: [3],
  pieces: {
    flower: "Traveling Doctor's Silver Lotus",
    plume: "Traveling Doctor's Owl Feather",
    sands: "Traveling Doctor's Pocket Watch",
    goblet: "Traveling Doctor's Medicine Pot",
    circlet: "Traveling Doctor's Handkerchief Crown"
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
      text: "Increases incoming healing by 20%.",
      stats: { inc_heal: 20 }
    },
    4: {
      text: (charFinalStats) => <span>Using Elemental Burst restores 20% HP{WeaponPercent(20, charFinalStats.hp)}.</span>,
    }
  }
}
export default artifact