import flower from './Item_Flower_of_Accolades.png'
import plume from './Item_Ceremonial_War-Plume.png'
import sands from './Item_Orichalceous_Time-Dial.png'
import goblet from './Item_Noble\'s_Pledging_Vessel.png'
import circlet from './Item_General\'s_Ancient_Helm.png'
import { IConditionals } from '../../../Types/IConditional'
import { IArtifactSheet } from '../../../Types/artifact'

const conditionals: IConditionals = {
  4: {
    name: "Elemental Skill hits an opponent",
    stats: { atk_: 20, powShield_: 30 }
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