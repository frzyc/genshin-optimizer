import flower from './Item_Lavawalker\'s_Resolution.png'
import plume from './Item_Lavawalker\'s_Salvation.png'
import sands from './Item_Lavawalker\'s_Torment.png'
import goblet from './Item_Lavawalker\'s_Epiphany.png'
import circlet from './Item_Lavawalker\'s_Wisdom.png'
let artifact = {
  name: "Lavawalker", rarity: [4, 5],
  pieces: {
    flower: "Lavawalker's Resolution",
    plume: "Lavawalker's Salvation",
    sands: "Lavawalker's Torment",
    goblet: "Lavawalker's Epiphany",
    circlet: "Lavawalker's Wisdom"
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
      text: <span><span className="text-pyro">Pyro RES</span> increased by 40%</span>,
      stats: { pyro_ele_res: 40 }
    },
    4: {
      text: <span>Increases DMG against enemies that are Burning or affected by <span className="text-pyro">Pyro</span> by 35%.</span>,
      conditional: {
        type: "artifact",
        sourceKey: "Lavawalker_4",
        maxStack: 1,
        stats: {
          dmg: 35,
        }
      }
    }
  }
}
export default artifact