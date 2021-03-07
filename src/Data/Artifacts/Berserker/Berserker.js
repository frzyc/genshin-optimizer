import flower from './Item_Berserker\'s_Rose.png'
import plume from './Item_Berserker\'s_Indigo_Feather.png'
import sands from './Item_Berserker\'s_Timepiece.png'
import goblet from './Item_Berserker\'s_Bone_Goblet.png'
import circlet from './Item_Berserker\'s_Battle_Mask.png'
let artifact = {
  name: "Berserker", rarity: [3, 4],
  pieces: {
    flower: "Berserker's Rose",
    plume: "Berserker's Indigo Feather",
    sands: "Berserker's Timepiece",
    goblet: "Berserker's Bone Goblet",
    circlet: "Berserker's Battle Mask"
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
      text: "CRIT Rate +12%",
      stats: { critRate_: 12 }
    },
    4: {
      text: "When HP is below 70%, CRIT Rate increases by an additional 24%.",
      conditional: {
        type: "artifact",
        sourceKey: "Berserker_4",
        maxStack: 1,
        stats: {
          critRate_: 24,
        }
      }
    }
  }
}
export default artifact