import circlet from './Item_Tiara_of_Frost.png'
let artifact = {
  name: "Prayers to Springtime", rarity: [3, 4], 
  pieces: {
    circlet: "Tiara of Frost"
  },
  icons: {
    circlet
  },
  sets: {
    1: {
      text: <span>Affected by <span className="text-cryo">Cryo</span> for 40% less time.</span>,
      stats: {}//TODO element affect reduction stat
    }
  }
}
export default artifact