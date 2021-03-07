import flower from './Item_Heart_of_Comradeship.png'
import plume from './Item_Feather_of_Homecoming.png'
import sands from './Item_Sundial_of_the_Sojourner.png'
import goblet from './Item_Goblet_of_the_Sojourner.png'
import circlet from './Item_Crown_of_Parting.png'
let artifact = {
  name: "Resolution of Sojourner", rarity: [3, 4],
  pieces: {
    flower: "Heart of Comradeship",
    plume: "Feather of Homecoming",
    sands: "Sundial of the Sojourner",
    goblet: "Goblet of the Sojourner",
    circlet: "Crown of Parting"
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
      text: "ATK +18%",
      stats: { atk_: 18 }
    },
    4: {
      text: "Increases Charged Attack CRIT Rate by 30%.",
      stats: { charged_critRate_: 30 }
    }
  }
}
export default artifact