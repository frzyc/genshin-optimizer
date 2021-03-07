import flower from './Item_Royal_Flora.png'
import plume from './Item_Royal_Plume.png'
import sands from './Item_Royal_Pocket_Watch.png'
import goblet from './Item_Royal_Silver_Urn.png'
import circlet from './Item_Royal_Masque.png'
let artifact = {
  name: "Noblesse Oblige", rarity: [4, 5], 
  pieces: {
    flower: "Royal Flora",
    plume: "Royal Plume",
    sands: "Royal Pocket Watch",
    goblet: "Royal Silver Urn",
    circlet: "Royal Masque"
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
      text: "Elemental Burst DMG +20%",
      stats: { burst_dmg_: 20 }
    },
    4: {
      text: "Using an Elemental Burst increase all party members' ATK by 20% for 12s. This effect cannot stack.",
      conditional: {//TODO party conditional
        type: "artifact",
        sourceKey: "NoblesseOblige_4",
        maxStack: 1,
        stats: {
          atk_: 20,
        }
      }
    }
  }
}
export default artifact