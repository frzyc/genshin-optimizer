import flower from './Item_Scholar\'s_Bookmark.png'
import plume from './Item_Scholar\'s_Quill_Pen.png'
import sands from './Item_Scholar\'s_Clock.png'
import goblet from './Item_Scholar\'s_Ink_Cup.png'
import circlet from './Item_Scholar\'s_Lens.png'
let artifact = {
  name: "Scholar", rarity: [3, 4],
  pieces: {
    flower: "Scholar's Bookmark",
    plume: "Scholar's Quill Pen",
    sands: "Scholar's Clock",
    goblet: "Scholar's Ink Cup",
    circlet: "Scholar's Lens"
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
      text: "Energy Recharge +20%",
      stats: { enerRech_: 20 }
    },
    4: {
      text: "Gaining Elemental Particles or Orbs gives 3 Energy to all party members who have a bow or a catalyst equipped. Can only occur once every 3s.",
    }
  }
}
export default artifact