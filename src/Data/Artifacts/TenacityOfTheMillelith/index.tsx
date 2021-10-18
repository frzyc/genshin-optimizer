import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IConditionals } from '../../../Types/IConditional'
import { IArtifactSheet } from '../../../Types/artifact'

const conditionals: IConditionals = {
  4: {
    name: "Elemental Skill hits an opponent",
    stats: { atk_: 20, shield_: 30 }
  }
}
const artifact: IArtifactSheet = {
  name: "Tenacity of the Millelith", rarity: [4, 5],
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
      stats: { hp_: 20 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact