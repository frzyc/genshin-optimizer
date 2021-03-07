import flower from './Item_Instructor\'s_Brooch.png'
import plume from './Item_Instructor\'s_Feather_Accessory.png'
import sands from './Item_Instructor\'s_Pocket_Watch.png'
import goblet from './Item_Instructor\'s_Tea_Cup.png'
import circlet from './Item_Instructor\'s_Cap.png'
let artifact = {
  name: "Instructor", rarity: [3, 4],
  pieces: {
    flower: "Instructor's Brooch",
    plume: "Instructor's Feathered Accessory",
    sands: "Instructor's Pocket Watch",
    goblet: "Instructor's Tea Cup",
    circlet: "Instructor's Cap"
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
      text: "Increases Elemental Mastery by 80.",
      stats: { eleMas: 80 }
    },
    4: {
      text: "After using Elemental Skill, increases all party members' Elemental Mastery by 120 for 8s.",
      conditional: {
        type: "artifact",
        sourceKey: "Instructor_4",
        maxStack: 1,
        stats: {
          eleMas: 120,//TODO all party conditional
        }
      }
    }
  }
}
export default artifact