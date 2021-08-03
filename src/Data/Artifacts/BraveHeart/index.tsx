import flower from './Item_Medal_of_the_Brave.png'
import plume from './Item_Prospect_of_the_Brave.png'
import sands from './Item_Fortitude_of_the_Brave.png'
import goblet from './Item_Outset_of_the_Brave.png'
import circlet from './Item_Crown_of_the_Brave.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  4: {
    name: "Enemy with more than 50% HP",
    stats: { dmg_: 30, }
  }
}
const artifact: IArtifactSheet = {
  name: "Brave Heart", rarity: [3, 4],
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
      stats: { atk_: 18 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact