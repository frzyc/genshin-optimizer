import circlet from './Item_Tiara_of_Thunder.png'
let artifact = {
  name: "Prayers for Wisdom", rarity: [3, 4],
  pieces: {
    circlet: "Tiara of Thunder"
  },
  icons: {
    circlet
  },
  sets: {
    1: {
      text: <span>Affected by <span className="text-electro">Electro</span> for 40% less time.</span>,
      stats: {}//TODO element affect reduction stat
    }
  }
}

export default artifact