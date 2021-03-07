import flower from './Item_Martial_Artist\'s_Red_Flower.png'
import plume from './Item_Martial_Artist\'s_Feather_Accessory.png'
import sands from './Item_Martial_Artist\'s_Water_Hourglass.png'
import goblet from './Item_Martial_Artist\'s_Wine_Cup.png'
import circlet from './Item_Martial_Artist\'s_Bandana.png'
let artifact = {
  name: "Martial Artist", rarity: [3, 4],
  pieces: {
    flower: "Martial Artist's Red Flower",
    plume: "Martial Artist's Feathered Accessory",
    sands: "Martial Artist's Water Hourglass",
    goblet: "Martial Artist's Wine Cup",
    circlet: "Martial Artist's Bandana"
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
      text: "Increases Normal Attack and Charged Attack DMG by 15%.",
      stats: {
        normal_dmg_: 15,
        charged_dmg_: 15
      }
    },
    4: {
      text: "After using Elemental Skill, increases Normal Attack and Charged Attack DMG by 25% for 8s.",
      conditional: {
        type: "artifact",
        sourceKey: "MartialArtist_4",
        maxStack: 1,
        stats: {
          normal_dmg_: 25,
          charged_dmg_: 25
        }
      }
    }
  }
}
export default artifact