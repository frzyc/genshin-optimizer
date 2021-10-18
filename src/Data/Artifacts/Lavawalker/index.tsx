import flower from './Item_Lavawalker\'s_Resolution.png'
import plume from './Item_Lavawalker\'s_Salvation.png'
import sands from './Item_Lavawalker\'s_Torment.png'
import goblet from './Item_Lavawalker\'s_Epiphany.png'
import circlet from './Item_Lavawalker\'s_Wisdom.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
import ColorText from '../../../Components/ColoredText'
const conditionals: IConditionals = {
  4: {
    name: <span>Enemies that are <ColorText color="burning">Burning</ColorText> or affected by <ColorText color="pyro">Pyro</ColorText></span>,
    stats: { dmg_: 35 }
  }
}
const artifact: IArtifactSheet = {
  name: "Lavawalker", rarity: [4, 5],
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
      stats: { pyro_res_: 40 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact