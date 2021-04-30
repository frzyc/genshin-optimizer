import flower from './Item_Maiden\'s_Distant_Love.png'
import plume from './Item_Maiden\'s_Heart-stricken_Infatuation.png'
import sands from './Item_Maiden\'s_Passing_Youth.png'
import goblet from './Item_Maiden\'s_Fleeting_Leisure.png'
import circlet from './Item_Maiden\'s_Fading_Beauty.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  set4: {
    name: "Using an Elemental Skill or Burst",
    stats: { incHeal_: 20 }//TODO: party buff
  }
}
const artifact: IArtifactSheet = {
  name: "Maiden Beloved", rarity: [4, 5],
  pieces: {
    flower: "Maiden's Distant Love",
    plume: "Maiden's Heart-stricken Infatuation",
    sands: "Maiden's Passing Youth",
    goblet: "Maiden's Fleeting Leisure",
    circlet: "Maiden's Fading Beauty"
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
      text: "Character Healing Effectiveness +15%",
      stats: { heal_: 15 }
    },
    4: {
      text: "Using an Elemental Skill or Burst increases healing received by all party members by 20% for 10s.",
      conditional: conditionals.set4
    }
  }
}
export default artifact