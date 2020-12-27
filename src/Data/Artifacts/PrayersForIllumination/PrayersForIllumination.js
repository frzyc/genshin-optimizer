import circlet from './Item_Tiara_of_Flame.png'
let artifact = {
  name: "Prayers for Illumination", rarity: [3, 4], 
  pieces: {
    circlet: "Tiara of Flame"
  },
  icons: {
    circlet
  },
  sets: {
    1: {
      text: "Affected by Pyro for 40% less time.",
      stats: {}//TODO element affect reduction stat
    }
  }
}
export default artifact