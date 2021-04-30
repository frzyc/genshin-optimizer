import flower from './Item_Lavawalker\'s_Resolution.png'
import plume from './Item_Lavawalker\'s_Salvation.png'
import sands from './Item_Lavawalker\'s_Torment.png'
import goblet from './Item_Lavawalker\'s_Epiphany.png'
import circlet from './Item_Lavawalker\'s_Wisdom.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  set4: {
    name: <span>Enemies that are Burning or affected by <span className="text-pyro">Pyro</span></span>,
    stats: { dmg_: 35 }
  }
}
const artifact: IArtifactSheet = {
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
  conditionals,
  setEffects: {
    2: {
      text: <span><span className="text-pyro">Pyro RES</span> increased by 40%</span>,
      stats: { pyro_res_: 40 }
    },
    4: {
      text: <span>Increases DMG against enemies that are Burning or affected by <span className="text-pyro">Pyro</span> by 35%.</span>,
      conditional: conditionals.set4
    }
  }
}
export default artifact