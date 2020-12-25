import flower from './Item_Witch\'s_Flower_of_Blaze.png'
import plume from './Item_Witch\'s_Ever-Burning_Plume.png'
import sands from './Item_Witch\'s_End_Time.png'
import goblet from './Item_Witch\'s_Heart_Flames.png'
import circlet from './Item_Witch\'s_Scorching_Hat.png'
let artifact = {
  name: "Crimson Witch of Flames", rarity: [4, 5],
  pieces: {
    flower: "Witch's Flower of Blaze",
    plume: "Witch's Ever-Burning Plume",
    sands: "Witch's End Time",
    goblet: "Witch's Heart Flames",
    circlet: "Witch's Scorching Hat"
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
      text: "Pyro DMG Bonus +15%",
      stats: { pyro_ele_dmg: 15 }
    },
    4: {
      text: "Increases Overloaded and Burning DMG by 40%. Increases Vaporize and Melt DMG by 15%. Using an Elemental Skill increases 2-Piece Set effects by 50% for 10s. Max 3 stacks.",
      stats: {}
    }
  }
}
export default artifact