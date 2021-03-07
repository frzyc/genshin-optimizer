import flower from './Item_Traveling_Doctor\'s_Silver_Lotus.png'
import plume from './Item_Traveling_Doctor\'s_Owl_Feather.png'
import sands from './Item_Traveling_Doctor\'s_Pocket_Watch.png'
import goblet from './Item_Traveling_Doctor\'s_Medicine_Pot.png'
import circlet from './Item_Traveling_Doctor\'s_Handkerchief.png'
import DisplayPercent from '../../../Components/DisplayPercent'
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
  setEffects: {
    2: {
      text: "Increases incoming healing by 20%.",
      stats: { incHeal_: 20 }
    },
    4: {
      text: (charFinalStats) => <span>Using Elemental Burst restores 20% HP{DisplayPercent(20, charFinalStats, "finalHP")}.</span>,
    }
  }
}
export default artifact